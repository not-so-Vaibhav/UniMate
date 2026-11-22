from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from app.services.retriever import retriever

router = APIRouter(prefix="/api/v1/assistant", tags=["AI Assistant"])

class StatusResponse(BaseModel):
    status: str
    phase: str
    capabilities: List[str]
    notes: str

class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000, description="User campus inquiry text")
    conversation_id: Optional[int] = Field(None, description="Optional conversation context identifier")
    history: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Recent conversation turns")

class SourceItem(BaseModel):
    id: str
    title: str
    source: str
    category: str

class QueryResponseData(BaseModel):
    grounded: bool
    confidence: float
    answer: str
    sources: List[SourceItem]
    suggested_followups: List[str]

class QueryResponse(BaseModel):
    success: bool
    data: QueryResponseData

@router.get("/status", response_model=StatusResponse)
async def get_assistant_status():
    """Returns the operational status of the grounded campus assistant subsystem."""
    return StatusResponse(
        status="active",
        phase="Phase 2 Integrated Core",
        capabilities=[
            "Verified campus knowledge retrieval",
            "Zero-hallucination uncertainty awareness",
            "Departmental & circular source attribution",
            "Contextual conversational history support"
        ],
        notes="Grounded against official campus regulations, library rules, dining hours, and health centre directories."
    )

@router.post("/query", response_model=QueryResponse)
async def process_assistant_query(request: QueryRequest):
    """
    Processes an incoming campus inquiry against verified institutional knowledge.
    Returns grounded answers with citations, or explicit uncertainty disclaimers.
    """
    cleaned_query = request.query.strip()
    if not cleaned_query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    result = retriever.search(cleaned_query)
    return QueryResponse(
        success=True,
        data=QueryResponseData(**result)
    )
