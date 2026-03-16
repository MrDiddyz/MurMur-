from backend.app.services.ocr_service import extract_text


def run(file_path: str) -> str:
    return extract_text(file_path)
