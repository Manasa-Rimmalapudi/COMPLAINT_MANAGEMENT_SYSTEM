
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Clock, User, Tag, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Database } from '../integrations/supabase/types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type Ticket = Database['public']['Tables']['tickets']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'];
};

interface TicketCardProps {
  ticket: Ticket;
  onStatusUpdate?: (ticketId: string, status: Database['public']['Enums']['ticket_status']) => void;
  showAdminActions?: boolean;
}

const TicketCard: React.FC<TicketCardProps> = ({ 
  ticket, 
  onStatusUpdate, 
  showAdminActions = false 
}) => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const getStatusColor = (status: Database['public']['Enums']['ticket_status']) => {
    switch (status) {
      case 'registered': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-600 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: Database['public']['Enums']['ticket_priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-600 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const getCategoryColor = (category: Database['public']['Enums']['ticket_category']) => {
    switch (category) {
      case 'billing': return 'bg-purple-500/20 text-purple-600 border-purple-500/30';
      case 'technical': return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      case 'service': return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'general': return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: Database['public']['Enums']['ticket_status']) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleViewTicket = () => {
    const basePath = profile?.role === 'admin' ? '/admin/tickets' : '/user/tickets';
    navigate(`${basePath}/${ticket.id}`);
  };

  const handleStatusChange = (newStatus: Database['public']['Enums']['ticket_status']) => {
    if (onStatusUpdate) {
      onStatusUpdate(ticket.id, newStatus);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/30">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center space-x-2">
              <span>Ticket #{ticket.id.slice(-8).toUpperCase()}</span>
            </CardTitle>
            <CardDescription className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(ticket.created_at)}</span>
              </div>
              {showAdminActions && ticket.profiles && (
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>{ticket.profiles.name}</span>
                </div>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(ticket.status)}
            <Badge className={getStatusColor(ticket.status)}>
              {ticket.status.replace('-', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
            {ticket.priority.toUpperCase()} Priority
          </Badge>
          <Badge variant="outline" className={getCategoryColor(ticket.category)}>
            <Tag className="w-3 h-3 mr-1" />
            {ticket.category.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {ticket.description}
          </p>
        </div>

        {ticket.assigned_team && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Assigned Team</div>
            <div className="font-medium text-sm">{ticket.assigned_team}</div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          {showAdminActions && onStatusUpdate && (
            <Select value={ticket.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="registered">New</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Button 
            onClick={handleViewTicket}
            variant="outline" 
            size="sm"
            className="ml-auto flex items-center space-x-1"
          >
            <span>View Details</span>
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketCard;
