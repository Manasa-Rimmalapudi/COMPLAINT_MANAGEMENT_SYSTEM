
#!/bin/bash
echo "Starting Smart Resolve AI ML Service..."
echo "Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate
echo "Installing dependencies..."
pip install -r requirements.txt
echo "Starting Flask server..."
python app.py
