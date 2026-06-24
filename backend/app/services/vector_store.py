import os
import faiss
import json
import numpy as np
from typing import List, Dict, Any
from langchain_ollama import OllamaEmbeddings
from app.core.config import settings

class VectorStore:
    def __init__(self, index_path: str = "vector_index.faiss"):
        self.index_path = index_path
        self.embeddings = OllamaEmbeddings(model=settings.OLLAMA_MODEL, base_url=settings.OLLAMA_BASE_URL)
        
        # Dynamically determine the dimension by embedding a test string
        test_embedding = self.embeddings.embed_query("test")
        self.dimension = len(test_embedding)
        
        self.metadata_path = "vector_metadata.json"
        
        if os.path.exists(self.index_path) and os.path.exists(self.metadata_path):
            self.index = faiss.read_index(self.index_path)
            with open(self.metadata_path, "r") as f:
                self.metadata = json.load(f)
        else:
            self.index = faiss.IndexFlatL2(self.dimension)
            self.metadata = []

    def add_texts(self, texts: List[str], metadatas: List[Dict[str, Any]]):
        embeddings = self.embeddings.embed_documents(texts)
        embeddings_np = np.array(embeddings).astype('float32')
        self.index.add(embeddings_np)
        self.metadata.extend(metadatas)
        self.save()

    def similarity_search(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        query_embedding = self.embeddings.embed_query(query)
        query_embedding_np = np.array([query_embedding]).astype('float32')
        distances, indices = self.index.search(query_embedding_np, k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx != -1 and idx < len(self.metadata):
                results.append({
                    "metadata": self.metadata[idx],
                    "distance": float(distances[0][i])
                })
        return results

    def save(self):
        faiss.write_index(self.index, self.index_path)
        with open(self.metadata_path, "w") as f:
            json.dump(self.metadata, f)

# Global instance for app
vector_store = None

def get_vector_store():
    global vector_store
    if vector_store is None:
        vector_store = VectorStore()
    return vector_store
