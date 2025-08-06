
import React, { useState } from 'react';
import Layout from '../components/Layout';
import Chatbot from '../components/Chatbot';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MessageCircle, Plus, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Ticket } from '../types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showChat, setShowChat] = useState(false);

  const handleTicketCreated = (ticket: Ticket) => {
    setTimeout(() => {
      navigate(`/user/tickets/${ticket.id}`);
    }, 2000);
  };

  const quickActions = [
    {
      title: 'Report a Bug',
      description: 'Something not working as expected?',
      action: () => setShowChat(true)
    },
    {
      title: 'Billing Issue',
      description: 'Questions about your account or payment?',
      action: () => setShowChat(true)
    },
    {
      title: 'Technical Support',
      description: 'Need help with technical issues?',
      action: () => setShowChat(true)
    },
    {
      title: 'General Inquiry',
      description: 'Have a question or suggestion?',
      action: () => setShowChat(true)
    }
  ];

  if (showChat) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setShowChat(false)}
              className="mb-4"
            >
              ← Back to Home
            </Button>
            <h1 className="text-2xl font-semibold mb-2">AI Assistant</h1>
            <p className="text-muted-foreground">
              Describe your issue and I'll help resolve it or create a support ticket for you.
            </p>
          </div>
          <Chatbot onTicketCreated={handleTicketCreated} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            How can I help you today?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            I'm your AI assistant, ready to help with any questions or issues you might have.
          </p>
        </div>

        {/* Main Chat Button */}
        <div className="mb-8">
          <Button
            onClick={() => setShowChat(true)}
            size="lg"
            className="w-full max-w-2xl mx-auto flex items-center justify-center space-x-3 h-16 text-lg rounded-2xl"
          >
            <MessageCircle className="w-6 h-6" />
            <span>Start a conversation</span>
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-center">Or choose a quick action:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20"
                onClick={action.action}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/user/dashboard')}
            className="rounded-xl"
          >
            View My Tickets
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
