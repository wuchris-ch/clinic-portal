export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "staff" | "admin";
export type RequestStatus = "pending" | "approved" | "denied";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      leave_types: {
        Row: {
          id: string;
          name: string;
          color: string;
          is_single_day: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          is_single_day?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          is_single_day?: boolean;
          created_at?: string;
        };
      };
      pay_periods: {
        Row: {
          id: string;
          period_number: number;
          start_date: string;
          end_date: string;
          t4_year: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          period_number: number;
          start_date: string;
          end_date: string;
          t4_year: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          period_number?: number;
          start_date?: string;
          end_date?: string;
          t4_year?: number;
          created_at?: string;
        };
      };
      leave_requests: {
        Row: {
          id: string;
          user_id: string;
          leave_type_id: string;
          pay_period_id: string | null;
          submission_date: string;
          start_date: string;
          end_date: string;
          reason: string;
          coverage_name: string | null;
          coverage_email: string | null;
          status: RequestStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          leave_type_id: string;
          pay_period_id?: string | null;
          submission_date: string;
          start_date: string;
          end_date: string;
          reason: string;
          coverage_name?: string | null;
          coverage_email?: string | null;
          status?: RequestStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          leave_type_id?: string;
          pay_period_id?: string | null;
          submission_date?: string;
          start_date?: string;
          end_date?: string;
          reason?: string;
          coverage_name?: string | null;
          coverage_email?: string | null;
          status?: RequestStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      leave_request_dates: {
        Row: {
          id: string;
          request_id: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          date?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          request_id: string;
          type: string;
          sent_at: string;
          email_sent: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          request_id: string;
          type: string;
          sent_at?: string;
          email_sent?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          request_id?: string;
          type?: string;
          sent_at?: string;
          email_sent?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      request_status: RequestStatus;
    };
  };
}

// Helper types for easier usage
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type LeaveType = Database["public"]["Tables"]["leave_types"]["Row"];
export type PayPeriod = Database["public"]["Tables"]["pay_periods"]["Row"];
export type LeaveRequest = Database["public"]["Tables"]["leave_requests"]["Row"];
export type LeaveRequestDate = Database["public"]["Tables"]["leave_request_dates"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];

// Extended types with relations
export type LeaveRequestWithDetails = LeaveRequest & {
  profiles: Profile;
  leave_types: LeaveType;
  leave_request_dates?: LeaveRequestDate[];
  reviewer?: Profile;
};

