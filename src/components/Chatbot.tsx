import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTickets } from '../hooks/useTickets';
import { Database } from '../integrations/supabase/types';
import { mlService, ChatMessage } from '../services/mlService';
import { toast } from 'sonner';

type Ticket = Database['public']['Tables']['tickets']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'];
};

interface ChatbotProps {
  onTicketCreated?: (ticket: Ticket) => void;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ onTicketCreated }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m here to help you with your complaints and questions. Please describe your issue, and I\'ll either provide assistance or create a support ticket for you.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [serviceHealth, setServiceHealth] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { createTicket } = useTickets();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkServiceHealth();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkServiceHealth = async () => {
    const isHealthy = await mlService.checkHealth();
    setServiceHealth(isHealthy);
    if (!isHealthy) {
      toast.error('ML Service is not available. Please ensure the Flask service is running on localhost:5000');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    if (serviceHealth === false) {
      toast.error('ML Service is not available. Please start the Flask service.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const chatHistory: ChatMessage[] = [
        {
          role: 'system',
          content: `You are a helpful customer service AI assistant for Smart Resolve AI. Your role is to:
1. Help users with their questions and complaints
2. Provide helpful information when possible
3. When you can't resolve an issue, inform the user you'll create a support ticket
4. Be friendly, professional, and empathetic
5. Keep responses concise but helpful`
        },
        ...messages.slice(-5).map(msg => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        })),
        {
          role: 'user',
          content: inputMessage.trim()
        }
      ];

      const aiResponse = await mlService.generateResponse(chatHistory);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, botMessage]);

      // Check if we should create a ticket
      if (shouldCreateTicket(inputMessage.trim(), aiResponse)) {
        await handleCreateTicket(inputMessage.trim());
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I apologize, but I\'m having trouble processing your request right now. Let me create a support ticket for you so our team can assist you directly.',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
      await handleCreateTicket(inputMessage.trim());
    } finally {
      setIsLoading(false);
    }
  };

  const shouldCreateTicket = (userMessage: string, botResponse: string): boolean => {
    const lowerUserMessage = userMessage.toLowerCase();
    const lowerBotResponse = botResponse.toLowerCase();
    
    const ticketKeywords = ['problem', 'issue', 'bug', 'error', 'complaint', 'help', 'support', 'not working', 'broken'];
    const hasTicketKeyword = ticketKeywords.some(keyword => lowerUserMessage.includes(keyword));
    
    const botSuggestsTicket = lowerBotResponse.includes('ticket') || 
                             lowerBotResponse.includes('support team') ||
                             lowerBotResponse.includes('human support');
    
    return hasTicketKeyword || botSuggestsTicket;
  };

  const handleCreateTicket = async (description: string) => {
    if (!user || isCreatingTicket) return;

    setIsCreatingTicket(true);

    try {
      const ticketInfo = await mlService.categorizeTicket(description);
      
      const newTicket = await createTicket({
        description: description,
        category: ticketInfo.category,
        priority: ticketInfo.priority,
        assigned_team: ticketInfo.assigned_team,
      });

      const ticketMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'bot',
        content: `I've created a support ticket for you! 
        
Ticket ID: ${newTicket.id}
Category: ${ticketInfo.category}
Priority: ${ticketInfo.priority}
Assigned Team: ${ticketInfo.assigned_team}

Our ${ticketInfo.assigned_team} team will review your ticket and get back to you soon. You can track the progress in your dashboard.`,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, ticketMessage]);
      
      if (onTicketCreated) {
        onTicketCreated(newTicket);
      }

      toast.success('Support ticket created successfully!');
    } catch (error) {
      console.error('Error creating ticket:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'bot',
        content: 'I apologize, but there was an error creating your support ticket. Please try again or contact our support team directly.',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to create ticket. Please try again.');
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-primary" />
            <span>AI Assistant</span>
          </div>
          {serviceHealth === false && (
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">Service Offline</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4 p-4">
        {serviceHealth === false && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">ML Service Unavailable</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Please start the Flask ML service on localhost:5000 to use the AI assistant.
            </p>
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-muted">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'bot' && (
                    <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                  {message.type === 'user' && (
                    <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {(isLoading || isCreatingTicket) && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">
                    {isCreatingTicket ? 'Creating support ticket...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message or describe your issue..."
            disabled={isLoading || isCreatingTicket || serviceHealth === false}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || isCreatingTicket || serviceHealth === false}
            size="icon"
          >
            {isLoading || isCreatingTicket ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Chatbot;
