
const ML_SERVICE_URL = "http://localhost:5000";

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class MLService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = ML_SERVICE_URL;
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages
        })
      });

      if (!response.ok) {
        throw new Error(`ML Service error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.response) {
        return data.response;
      } else {
        throw new Error('No response generated');
      }
    } catch (error) {
      console.error('ML Service error:', error);
      throw new Error('Failed to generate AI response. Please ensure the ML service is running.');
    }
  }

  async categorizeTicket(description: string): Promise<{
    category: 'billing' | 'technical' | 'service' | 'general';
    priority: 'urgent' | 'high' | 'medium' | 'low';
    assigned_team: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/categorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description
        })
      });

      if (!response.ok) {
        throw new Error(`ML Service error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        category: data.category || 'general',
        priority: data.priority || 'medium',
        assigned_team: data.assigned_team || 'General Support'
      };
    } catch (error) {
      console.error('Categorization error:', error);
      return this.fallbackCategorization(description);
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  private fallbackCategorization(description: string): {
    category: 'billing' | 'technical' | 'service' | 'general';
    priority: 'urgent' | 'high' | 'medium' | 'low';
    assigned_team: string;
  } {
    const lowerDesc = description.toLowerCase();
    
    let category: 'billing' | 'technical' | 'service' | 'general' = 'general';
    let priority: 'urgent' | 'high' | 'medium' | 'low' = 'medium';
    let assigned_team = 'General Support';

    if (lowerDesc.includes('billing') || lowerDesc.includes('payment') || lowerDesc.includes('invoice')) {
      category = 'billing';
      assigned_team = 'Billing Support';
    } else if (lowerDesc.includes('technical') || lowerDesc.includes('bug') || lowerDesc.includes('error') || lowerDesc.includes('crash')) {
      category = 'technical';
      assigned_team = 'Technical Support';
    } else if (lowerDesc.includes('service') || lowerDesc.includes('support') || lowerDesc.includes('help')) {
      category = 'service';
      assigned_team = 'Customer Service';
    }

    if (lowerDesc.includes('urgent') || lowerDesc.includes('emergency') || lowerDesc.includes('critical')) {
      priority = 'urgent';
    } else if (lowerDesc.includes('important') || lowerDesc.includes('asap')) {
      priority = 'high';
    } else if (lowerDesc.includes('low') || lowerDesc.includes('minor')) {
      priority = 'low';
    }

    return { category, priority, assigned_team };
  }
}

export const mlService = new MLService();
