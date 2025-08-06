
import { Database } from '../integrations/supabase/types';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

// Use Supabase database types directly
export type Ticket = Database['public']['Tables']['tickets']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'];
};

export type NewTicket = Database['public']['Tables']['tickets']['Insert'];

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
}

export interface AnalyticsData {
  totalTickets: number;
  resolvedTickets: number;
  avgResolutionTime: number;
  ticketsByCategory: { category: string; count: number }[];
  ticketsByPriority: { priority: string; count: number }[];
  ticketsByStatus: { status: string; count: number }[];
}

// Supabase types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type TicketData = Database['public']['Tables']['tickets']['Row'];
export type ChatMessageData = Database['public']['Tables']['chat_messages']['Row'];
