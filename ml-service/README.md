
# ML Service for Smart Resolve AI

## Setup

1. Install Python 3.8+
2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.
   ```
4. Run the service:
   ```bash
   python app.py
   ```

The service will run on http://localhost:5000

## Endpoints

- `POST /api/chat` - Generate AI responses
- `POST /api/categorize` - Categorize tickets
- `GET /api/health` - Health check

## Usage

The service replaces the OpenRouter API with a local ML model that provides:
- Intelligent response generation
- Ticket categorization
- Priority assignment
- Team routing
