from backend.app.services.match_service import find_relationship_conflicts


def run() -> list[str]:
    return find_relationship_conflicts()
