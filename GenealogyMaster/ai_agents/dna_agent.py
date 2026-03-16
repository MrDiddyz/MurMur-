from backend.app.services.dna_service import parse_dna_file


def run(file_path: str) -> dict[str, str]:
    return parse_dna_file(file_path)
