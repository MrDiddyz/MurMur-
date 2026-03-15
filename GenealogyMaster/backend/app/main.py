from fastapi import FastAPI

from app.routers import dna_router, document_router, family_router, person_router

app = FastAPI(title="GenealogyMaster API", version="0.1.0")

app.include_router(person_router.router, prefix="/api/persons", tags=["persons"])
app.include_router(person_router.router, prefix="/persons", tags=["persons"])
app.include_router(family_router.router, prefix="/families", tags=["families"])
app.include_router(document_router.router, prefix="/documents", tags=["documents"])
app.include_router(dna_router.router, prefix="/dna", tags=["dna"])


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
