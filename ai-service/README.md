# UniMate AI Service

This service provides the AI / NLP infrastructure foundation for UniMate using Python and FastAPI.

## Setup Instructions

1. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the development server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. Health Check:
   - Endpoint: `http://localhost:8000/health`
   - Status: `http://localhost:8000/api/v1/assistant/status`
   - Interactive OpenAPI Docs: `http://localhost:8000/docs`
