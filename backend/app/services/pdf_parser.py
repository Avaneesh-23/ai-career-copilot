import fitz  # PyMuPDF

def parse_pdf(file_bytes: bytes) -> str:
    """Extracts text from a PDF file byte stream."""
    text = ""
    try:
        pdf_document = fitz.open(stream=file_bytes, filetype="pdf")
        for page_num in range(len(pdf_document)):
            page = pdf_document.load_page(page_num)
            text += page.get_text("text") + "\n"
        pdf_document.close()
    except Exception as e:
        print(f"Error parsing PDF: {e}")
    return text.strip()
