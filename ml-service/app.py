
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import re
import json
from datetime import datetime
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleMLModel:
    def __init__(self):
        # Simple keyword-based categorization
        self.categories = {
            'billing': ['billing', 'payment', 'invoice', 'charge', 'refund', 'subscription', 'cost', 'price'],
            'technical': ['technical', 'bug', 'error', 'crash', 'broken', 'not working', 'issue', 'problem', 'failure'],
            'service': ['service', 'support', 'help', 'assistance', 'customer', 'account', 'login', 'access'],
            'general': ['question', 'inquiry', 'information', 'general', 'other', 'misc']
        }
        
        self.priorities = {
            'urgent': ['urgent', 'emergency', 'critical', 'immediate', 'asap'],
            'high': ['important', 'high', 'priority', 'soon'],
            'low': ['minor', 'low', 'later', 'eventually'],
            'medium': []  # default
        }
        
        self.responses = {
            'greeting': "Hello! I'm here to help you with your complaints and questions. Please describe your issue, and I'll either provide assistance or create a support ticket for you.",
            'billing': "I understand you have a billing concern. Let me help you with that or create a ticket for our billing team to assist you.",
            'technical': "I see you're experiencing a technical issue. Let me gather some information to help resolve this or escalate it to our technical team.",
            'service': "I'm here to help with your service inquiry. Please provide more details so I can assist you better.",
            'general': "Thank you for your inquiry. I'll do my best to help you or direct you to the right team for assistance.",
            'default': "I understand your concern. Let me create a support ticket so our team can assist you properly."
        }

    def categorize_text(self, text):
        text_lower = text.lower()
        
        # Determine category
        category_scores = {}
        for cat, keywords in self.categories.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            category_scores[cat] = score
        
        category = max(category_scores, key=category_scores.get) if max(category_scores.values()) > 0 else 'general'
        
        # Determine priority
        priority_scores = {}
        for pri, keywords in self.priorities.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            priority_scores[pri] = score
        
        priority = max(priority_scores, key=priority_scores.get) if max(priority_scores.values()) > 0 else 'medium'
        
        # Assign team based on category
        team_mapping = {
            'billing': 'Billing Support',
            'technical': 'Technical Support',
            'service': 'Customer Service',
            'general': 'General Support'
        }
        
        return {
            'category': category,
            'priority': priority,
            'assigned_team': team_mapping.get(category, 'General Support')
        }

    def generate_response(self, messages):
        # Extract the last user message
        user_message = ""
        for msg in reversed(messages):
            if msg.get('role') == 'user':
                user_message = msg.get('content', '')
                break
        
        if not user_message:
            return self.responses['default']
        
        # Simple keyword-based response generation
        user_message_lower = user_message.lower()
        
        # Check for greetings
        if any(greeting in user_message_lower for greeting in ['hello', 'hi', 'hey', 'good morning', 'good afternoon']):
            return self.responses['greeting']
        
        # Categorize the message to provide appropriate response
        categorization = self.categorize_text(user_message)
        category = categorization['category']
        
        # Generate contextual response
        base_response = self.responses.get(category, self.responses['default'])
        
        # Add some variation based on specific keywords
        if 'password' in user_message_lower or 'login' in user_message_lower:
            return "I can help you with login issues. Let me create a support ticket for our technical team to reset your credentials or assist with access problems."
        elif 'refund' in user_message_lower:
            return "I understand you're inquiring about a refund. Let me create a billing ticket so our billing team can review your request and process it accordingly."
        elif 'slow' in user_message_lower or 'performance' in user_message_lower:
            return "I see you're experiencing performance issues. Let me create a technical support ticket so our team can investigate and optimize the performance for you."
        
        return base_response

# Initialize the model
ml_model = SimpleMLModel()

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        messages = data.get('messages', [])
        
        if not messages:
            return jsonify({'error': 'No messages provided'}), 400
        
        response = ml_model.generate_response(messages)
        
        logger.info(f"Generated response for {len(messages)} messages")
        
        return jsonify({
            'response': response,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/categorize', methods=['POST'])
def categorize():
    try:
        data = request.get_json()
        description = data.get('description', '')
        
        if not description:
            return jsonify({'error': 'No description provided'}), 400
        
        result = ml_model.categorize_text(description)
        
        logger.info(f"Categorized ticket: {result}")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in categorize endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
