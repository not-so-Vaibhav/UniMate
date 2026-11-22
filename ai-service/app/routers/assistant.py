from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import logging
from app.config import settings
from app.services.retriever import retriever
from app.services.gemini_provider import gemini_provider

logger = logging.getLogger("unimate.ai.router")

router = APIRouter(prefix="/api/v1/assistant", tags=["AI Assistant"])

class StatusResponse(BaseModel):
    status: str
    phase: str
    ai_mode: str
    gemini_configured: bool
    gemini_model: str
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
    provider_used: str  # 'deterministic' | 'gemini' | 'deterministic_fallback'
    model_used: Optional[str] = None
    suggested_followups: List[str]

class QueryResponse(BaseModel):
    success: bool
    data: QueryResponseData

class SyncCorpusRequest(BaseModel):
    documents: List[Dict[str, Any]]

@router.get("/status", response_model=StatusResponse)
async def get_assistant_status():
    """Returns the operational status and hybrid AI mode of the assistant subsystem."""
    return StatusResponse(
        status="active",
        phase="Phase 3 Hybrid AI & Production Readiness",
        ai_mode=settings.AI_MODE,
        gemini_configured=gemini_provider.is_available(),
        gemini_model=settings.GEMINI_MODEL,
        capabilities=[
            "Deterministic keyword & phrase retrieval",
            "Gemini grounded generation (when configured)",
            "Zero-hallucination uncertainty awareness",
            "Automatic fallback from Gemini to deterministic extraction",
            "Departmental & circular source attribution",
            "Dynamic verified document corpus synchronization"
        ],
        notes="Grounded against official campus regulations, library rules, dining hours, and verified circulars."
    )

@router.post("/query", response_model=QueryResponse)
async def process_assistant_query(request: QueryRequest):
    """
    Processes an incoming campus inquiry against verified institutional knowledge.
    Applies the approved Hybrid RAG architecture:
    1. Search verified corpus with deterministic retriever
    2. Enforce uncertainty threshold (< 0.28 -> refusal with counter guidance)
    3. If evidence sufficient:
       - If AI_MODE is DETERMINISTIC_ONLY or Gemini unavailable -> deterministic extraction
       - If AI_MODE is HYBRID and Gemini available -> grounded generation via Gemini SDK
       - If Gemini fails or times out -> seamless fallback to deterministic extraction
    """
    cleaned_query = request.query.strip()
    if not cleaned_query:
        raise HTTPException(status_code=400, detail="Query cannot be empty or whitespace only.")

    # 1. Deterministic retrieval and confidence scoring
    retrieval_result = retriever.search(cleaned_query, threshold=settings.CONFIDENCE_THRESHOLD)

    # 2. Uncertainty gate: insufficient evidence
    if not retrieval_result.get("grounded", False):
        return QueryResponse(
            success=True,
            data=QueryResponseData(
                grounded=False,
                confidence=retrieval_result.get("confidence", 0.0),
                answer=retrieval_result.get("answer"),
                sources=[],
                provider_used="deterministic",
                model_used=None,
                suggested_followups=retrieval_result.get("suggested_followups", [])
            )
        )

    # Evidence is sufficient (grounded == True)
    matched_docs = retrieval_result.get("matched_docs", [])
    sources = [SourceItem(**s) for s in retrieval_result.get("sources", [])]
    followups = retrieval_result.get("suggested_followups", [])
    confidence = retrieval_result.get("confidence", 1.0)
    deterministic_answer = retrieval_result.get("answer")

    # 3. Mode Evaluation: DETERMINISTIC_ONLY
    if settings.AI_MODE == "DETERMINISTIC_ONLY" or not gemini_provider.is_available():
        return QueryResponse(
            success=True,
            data=QueryResponseData(
                grounded=True,
                confidence=confidence,
                answer=deterministic_answer,
                sources=sources,
                provider_used="deterministic",
                model_used=None,
                suggested_followups=followups
            )
        )

    # 4. Mode Evaluation: HYBRID or GEMINI_ONLY
    if gemini_provider.is_available():
        gemini_result = gemini_provider.generate_grounded_answer(
            query=cleaned_query,
            retrieved_docs=matched_docs,
            history=request.history
        )

        if gemini_result.get("success", False) and gemini_result.get("answer"):
            return QueryResponse(
                success=True,
                data=QueryResponseData(
                    grounded=True,
                    confidence=confidence,
                    answer=gemini_result["answer"],
                    sources=sources,
                    provider_used="gemini",
                    model_used=gemini_result.get("model", settings.GEMINI_MODEL),
                    suggested_followups=followups
                )
            )
        else:
            # Gemini failed, timed out, or returned empty
            logger.warning(
                f"[Assistant] Gemini generation failed ({gemini_result.get('reason')}). "
                f"Mode: {settings.AI_MODE}."
            )

            if settings.AI_MODE == "GEMINI_ONLY":
                raise HTTPException(
                    status_code=502,
                    detail=f"Gemini generation failed and deterministic fallback is disabled: {gemini_result.get('reason')}"
                )

            # HYBRID mode: Graceful fallback to deterministic extraction
            return QueryResponse(
                success=True,
                data=QueryResponseData(
                    grounded=True,
                    confidence=confidence,
                    answer=deterministic_answer,
                    sources=sources,
                    provider_used="deterministic_fallback",
                    model_used=None,
                    suggested_followups=followups
                )
            )

    # Fallback default
    return QueryResponse(
        success=True,
        data=QueryResponseData(
            grounded=True,
            confidence=confidence,
            answer=deterministic_answer,
            sources=sources,
            provider_used="deterministic",
            model_used=None,
            suggested_followups=followups
        )
    )

@router.post("/corpus/sync")
async def sync_knowledge_corpus(payload: SyncCorpusRequest):
    """
    Admin-controlled synchronization of verified institutional documents into the active retrieval index.
    """
    if not payload.documents:
        raise HTTPException(status_code=400, detail="Documents list cannot be empty.")

    # Re-index documents
    retriever.corpus = payload.documents
    return {
        "success": True,
        "message": f"Successfully synchronized {len(payload.documents)} documents into the active AI knowledge index.",
        "active_document_count": len(retriever.corpus)
    }
