
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Database } from '../integrations/supabase/types';
import { useToast } from '@/components/ui/use-toast';

type Ticket = Database['public']['Tables']['tickets']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'];
};

type NewTicket = Database['public']['Tables']['tickets']['Insert'];

export const useTickets = (userId?: string) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, [userId]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('tickets')
        .select(`
          *,
          profiles (*)
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tickets:', error);
        toast({
          title: "Error",
          description: "Failed to fetch tickets",
          variant: "destructive",
        });
        return;
      }

      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tickets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTicket = async (ticketData: Omit<NewTicket, 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('tickets')
        .insert([
          {
            ...ticketData,
            user_id: user.id,
          }
        ])
        .select(`
          *,
          profiles (*)
        `)
        .single();

      if (error) {
        console.error('Error creating ticket:', error);
        throw error;
      }

      setTickets(prev => [data, ...prev]);
      
      toast({
        title: "Success",
        description: "Ticket created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to create ticket",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTicketStatus = async (ticketId: string, status: Database['public']['Enums']['ticket_status']) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status })
        .eq('id', ticketId);

      if (error) {
        console.error('Error updating ticket:', error);
        throw error;
      }

      setTickets(prev =>
        prev.map(ticket =>
          ticket.id === ticketId
            ? { ...ticket, status, updated_at: new Date().toISOString() }
            : ticket
        )
      );

      toast({
        title: "Success",
        description: "Ticket status updated successfully",
      });
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    tickets,
    isLoading,
    createTicket,
    updateTicketStatus,
    refetch: fetchTickets,
  };
};
