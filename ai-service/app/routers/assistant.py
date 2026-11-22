from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/assistant", tags=["AI Assistant Foundation"])

class StatusResponse(BaseModel):
    status: str
    phase: str
    capabilities: list[str]
    notes: str

@router.get("/status", response_model=StatusResponse)
async def get_assistant_status():
    """
    Returns the foundational readiness status of the UniMate AI Assistant service.
    Full NLP / model grounding will be integrated in subsequent phases.
    """
    return StatusResponse(
        status="ready_for_phase_integration",
        phase="Phase 1 Foundation",
        capabilities=[
            "Campus query handling (Planned)",
            "Grounding in verified campus directory (Planned)",
            "Contextual conversational history (Planned)",
        ],
        notes="FastAPI infrastructure is active and ready for model connectivity in Phase 2."
    )
