from fastapi import HTTPException, status


class InvalidAPIKeyError(HTTPException):
    """Raised when a request uses a missing or invalid API key."""

    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )
