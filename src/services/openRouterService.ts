
const OPENROUTER_API_KEY = "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";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class OpenRouterService {
  private apiKey: string;

  constructor() {
    this.apiKey = OPENROUTER_API_KEY;
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Smart Resolve AI'
        },
        body: JSON.stringify({
          model: 'google/gemma-2-9b-it:free',
          messages: messages,
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      } else {
        throw new Error('No response generated');
      }
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw new Error('Failed to generate AI response. Please try again.');
    }
  }

  async categorizeTicket(description: string): Promise<{
    category: 'billing' | 'technical' | 'service' | 'general';
    priority: 'urgent' | 'high' | 'medium' | 'low';
    assigned_team: string;
  }> {
    try {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: `You are an AI assistant that categorizes support tickets. Given a ticket description, respond with only a JSON object containing:
- category: one of "billing", "technical", "service", "general"
- priority: one of "urgent", "high", "medium", "low" 
- assigned_team: appropriate team name

Example: {"category": "billing", "priority": "high", "assigned_team": "Billing Support"}`
        },
        {
          role: 'user',
          content: `Categorize this ticket: ${description}`
        }
      ];

      const response = await this.generateResponse(messages);
      
      try {
        const parsed = JSON.parse(response);
        return {
          category: parsed.category || 'general',
          priority: parsed.priority || 'medium',
          assigned_team: parsed.assigned_team || 'General Support'
        };
      } catch {
        // Fallback categorization
        return this.fallbackCategorization(description);
      }
    } catch (error) {
      console.error('Categorization error:', error);
      return this.fallbackCategorization(description);
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

export const openRouterService = new OpenRouterService();
