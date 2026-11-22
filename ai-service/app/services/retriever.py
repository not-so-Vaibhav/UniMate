import json
import os
import re
from typing import List, Dict, Any, Optional

CORPUS_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "knowledge", "campus_corpus.json")

# Common English stop words to filter out
STOP_WORDS = {
    "a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or", "is", "are",
    "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "can", "could", "would", "should", "what", "where", "when", "why", "how", "who",
    "which", "there", "their", "they", "i", "we", "you", "my", "your", "it", "its",
    "please", "tell", "me", "about", "give", "provide", "know", "information"
}

def tokenize(text: str) -> List[str]:
    """Tokenize and normalize text into meaningful content words."""
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
    tokens = [t.strip() for t in cleaned.split() if len(t.strip()) > 1]
    return [t for t in tokens if t not in STOP_WORDS]

class CampusKnowledgeRetriever:
    def __init__(self, corpus_file: str = CORPUS_PATH):
        self.corpus: List[Dict[str, Any]] = []
        self.load_corpus(corpus_file)

    def load_corpus(self, file_path: str):
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                self.corpus = json.load(f)
        else:
            self.corpus = []

    def score_document(self, doc: Dict[str, Any], query_tokens: List[str], raw_query: str) -> float:
        if not query_tokens:
            return 0.0

        doc_title_tokens = set(tokenize(doc.get("title", "")))
        doc_keyword_tokens = set()
        for kw in doc.get("keywords", []):
            doc_keyword_tokens.update(tokenize(kw))
        doc_summary_tokens = set(tokenize(doc.get("summary", "")))

        # 1. Exact phrase match bonus
        raw_lower = raw_query.lower()
        phrase_bonus = 0.0
        for kw in doc.get("keywords", []):
            if kw.lower() in raw_lower:
                phrase_bonus += 0.35

        # 2. Keyword overlap
        kw_overlap = len(set(query_tokens).intersection(doc_keyword_tokens))
        title_overlap = len(set(query_tokens).intersection(doc_title_tokens))
        summary_overlap = len(set(query_tokens).intersection(doc_summary_tokens))

        total_tokens = len(query_tokens)
        score = (
            (kw_overlap * 0.40) +
            (title_overlap * 0.35) +
            (summary_overlap * 0.15) +
            phrase_bonus
        ) / max(total_tokens, 1)

        return min(round(score, 2), 1.0)

    def search(self, query: str, threshold: float = 0.28) -> Dict[str, Any]:
        """
        Performs strict grounded retrieval.
        If score < threshold, adheres strictly to non-hallucination policy.
        """
        query_tokens = tokenize(query)
        if not query_tokens:
            return {
                "grounded": False,
                "confidence": 0.0,
                "answer": "Please provide a specific inquiry regarding campus services, library regulations, dining schedules, or administrative procedures.",
                "sources": [],
                "suggested_followups": [
                    "What are the library working hours?",
                    "How do I apply for examination revaluation?",
                    "What are the Xerox printing rates?",
                    "What is the hostel in-time curfew?"
                ]
            }

        scored_docs = []
        for doc in self.corpus:
            score = self.score_document(doc, query_tokens, query)
            if score > 0.0:
                scored_docs.append((score, doc))

        scored_docs.sort(key=lambda x: x[0], reverse=True)

        if not scored_docs or scored_docs[0][0] < threshold:
            return {
                "grounded": False,
                "confidence": scored_docs[0][0] if scored_docs else 0.0,
                "answer": (
                    "I could not find an official campus circular or document regarding this inquiry in the verified university registry. "
                    "To prevent misinformation, please consult the relevant departmental counter or administrative desk directly."
                ),
                "sources": [],
                "suggested_followups": [
                    "What are the central library working hours?",
                    "What are the printing rates at the Xerox counter?",
                    "Where is the Academic Section counter located?",
                    "What is the procedure to claim a lost item?"
                ]
            }

        # Match found! Formulate grounded answer from verified source
        top_score, top_doc = scored_docs[0]

        # Build structured, professional response
        key_points_text = "\n".join([f"• {pt}" for pt in top_doc.get("key_points", [])])
        answer_text = (
            f"{top_doc['summary']}\n\n"
            f"**Key Details:**\n{key_points_text}\n\n"
            f"*(Source: {top_doc['source']})*"
        )

        sources = [
            {
                "id": top_doc["id"],
                "title": top_doc["title"],
                "source": top_doc["source"],
                "category": top_doc["category"],
            }
        ]

        # Include second source if closely related
        if len(scored_docs) > 1 and scored_docs[1][0] >= 0.40:
            second_doc = scored_docs[1][1]
            sources.append({
                "id": second_doc["id"],
                "title": second_doc["title"],
                "source": second_doc["source"],
                "category": second_doc["category"],
            })

        return {
            "grounded": True,
            "confidence": top_score,
            "answer": answer_text,
            "sources": sources,
            "suggested_followups": self._generate_followups(top_doc["category"])
        }

    def _generate_followups(self, category: str) -> List[str]:
        followups_by_cat = {
            "library": [
                "What is the fine for overdue library books?",
                "Can reference books be issued overnight?",
                "What are the weekend reading room timings?"
            ],
            "academics": [
                "What is the fee for semester revaluation?",
                "Where is the Cash Counter for fee submission?",
                "What are the Academic Section afternoon counter timings?"
            ],
            "hostel": [
                "What is the night-out pass application deadline?",
                "Who must be notified for late hostel entry?",
                "Where is the Chief Warden office?"
            ],
            "printing": [
                "What is the cost of spiral binding?",
                "What file formats are accepted at the printing hub?",
                "Where is Counter 2 of the printing center located?"
            ],
            "canteen": [
                "What are the evening snack timings at the canteen?",
                "Where is the pre-order meal pickup counter?",
                "What time does lunch service begin?"
            ],
            "lost_found": [
                "Where is the Main Gate Security Cabin situated?",
                "What identification is required to claim an item?",
                "How long are unclaimed items stored?"
            ],
            "health": [
                "What are the outpatient doctor consultation hours?",
                "What is the internal intercom number for medical emergencies?",
                "Where is the Health Centre located?"
            ],
            "administration": [
                "When can students visit the Dean of Student Affairs?",
                "Where is Room 210 in the Administrative Block?",
                "What matters does the DoSA office handle?"
            ]
        }
        return followups_by_cat.get(category, [
            "What are the central library working hours?",
            "What are the printing rates at the Xerox counter?",
            "Where is the Academic Section counter located?"
        ])

# Singleton instance
retriever = CampusKnowledgeRetriever()
