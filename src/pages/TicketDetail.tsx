
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Clock, User, Tag, MessageSquare, CheckCircle, PlayCircle, AlertCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTickets } from '../hooks/useTickets';
import { toast } from '../components/ui/use-toast';

const TicketDetail: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tickets, updateTicketStatus } = useTickets(user?.role === 'admin' ? undefined : user?.id);
  const [isUpdating, setIsUpdating] = useState(false);

  const ticket = tickets.find(t => t.id === ticketId);

  if (!ticket) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-96">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Ticket Not Found</h2>
          <p className="text-muted-foreground mb-4">The ticket you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
        </div>
      </Layout>
    );
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateTicketStatus(ticket.id, newStatus as any);
      toast({
        title: "Status Updated",
        description: `Ticket status changed to ${newStatus.replace('-', ' ')}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'registered':
        return <Clock className="w-4 h-4" />;
      case 'in-progress':
        return <PlayCircle className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'bg-brand-yellow text-black';
      case 'in-progress':
        return 'bg-brand-blue text-white';
      case 'resolved':
        return 'bg-green-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-brand-orange text-white';
      case 'medium':
        return 'bg-brand-yellow text-black';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'billing':
        return 'bg-brand-purple/20 text-brand-purple border-brand-purple/30';
      case 'technical':
        return 'bg-brand-blue/20 text-brand-blue border-brand-blue/30';
      case 'service':
        return 'bg-brand-orange/20 text-brand-orange border-brand-orange/30';
      default:
        return 'bg-muted/50 text-muted-foreground border-border';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAdmin = user?.role === 'admin';
  const backPath = isAdmin ? '/admin/dashboard' : '/user/dashboard';

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={() => navigate(backPath)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Ticket #{ticket.id.slice(0, 8)}</h1>
              <p className="text-muted-foreground">
                Created on {formatDate(ticket.created_at)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">Complaint Details</CardTitle>
                    <CardDescription>
                      Full description of the reported issue
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                    <Badge variant="outline" className={getCategoryColor(ticket.category)}>
                      {ticket.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm leading-relaxed">{ticket.description}</p>
                  </div>
                  
                  {ticket.assigned_team && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>Assigned to: {ticket.assigned_team}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Activity Timeline</span>
                </CardTitle>
                <CardDescription>Track the progress of this ticket</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Ticket Created</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(ticket.created_at)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        AI automatically categorized as "{ticket.category}" with "{ticket.priority}" priority
                      </p>
                    </div>
                  </div>

                  {ticket.status !== 'registered' && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-brand-purple rounded-full flex items-center justify-center">
                        <PlayCircle className="w-4 h-4 text-white" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Processing Started</p>
                        <p className="text-xs text-muted-foreground">
                          Assigned to {ticket.assigned_team}
                        </p>
                      </div>
                    </div>
                  )}

                  {ticket.status === 'resolved' && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Ticket Resolved</p>
                        <p className="text-xs text-muted-foreground">
                          Issue has been successfully resolved
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <Badge className={`${getStatusColor(ticket.status)} flex items-center space-x-2 text-lg px-4 py-2`}>
                      {getStatusIcon(ticket.status)}
                      <span className="capitalize">{ticket.status.replace('-', ' ')}</span>
                    </Badge>
                  </div>
                  
                  {isAdmin && ticket.status !== 'resolved' && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Update Status:</p>
                      {ticket.status === 'registered' && (
                        <Button 
                          className="w-full"
                          onClick={() => handleStatusUpdate('in-progress')}
                          disabled={isUpdating}
                        >
                          Mark as In Progress
                        </Button>
                      )}
                      {ticket.status === 'in-progress' && (
                        <Button 
                          className="w-full"
                          onClick={() => handleStatusUpdate('resolved')}
                          disabled={isUpdating}
                        >
                          Mark as Resolved
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ticket Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ticket Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">ID</p>
                      <p className="font-mono">#{ticket.id.slice(0, 8)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Priority</p>
                      <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Category</p>
                      <Badge variant="outline" className={getCategoryColor(ticket.category)}>
                        {ticket.category}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Team</p>
                      <p>{ticket.assigned_team || 'Unassigned'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {!isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/home')}
                    >
                      Create New Complaint
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/user/dashboard')}
                    >
                      View All Tickets
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TicketDetail;
