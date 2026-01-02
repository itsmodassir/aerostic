export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action_details: Json | null
          action_type: string
          created_at: string
          id: string
          ip_address: string | null
          status: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          created_at?: string
          id?: string
          ip_address?: string | null
          status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      affiliate_products: {
        Row: {
          active: boolean | null
          affiliate_url: string
          badge: string | null
          category: string
          created_at: string | null
          description: string
          discount_percentage: string
          discount_price: string
          featured: boolean | null
          id: string
          image_url: string | null
          name: string
          original_price: string
          rating: number | null
          review_count: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          affiliate_url: string
          badge?: string | null
          category: string
          created_at?: string | null
          description: string
          discount_percentage: string
          discount_price: string
          featured?: boolean | null
          id?: string
          image_url?: string | null
          name: string
          original_price: string
          rating?: number | null
          review_count?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          affiliate_url?: string
          badge?: string | null
          category?: string
          created_at?: string | null
          description?: string
          discount_percentage?: string
          discount_price?: string
          featured?: boolean | null
          id?: string
          image_url?: string | null
          name?: string
          original_price?: string
          rating?: number | null
          review_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          event_data: Json | null
          event_name: string
          event_type: string
          id: string
          ip_address: string | null
          os: string | null
          page_path: string | null
          page_title: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_data?: Json | null
          event_name: string
          event_type: string
          id?: string
          ip_address?: string | null
          os?: string | null
          page_path?: string | null
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_data?: Json | null
          event_name?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          os?: string | null
          page_path?: string | null
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      assignment_submissions: {
        Row: {
          assignment_id: string
          created_at: string | null
          feedback: string | null
          grade: number | null
          graded_at: string | null
          id: string
          status: string
          submission_url: string | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assignment_id: string
          created_at?: string | null
          feedback?: string | null
          grade?: number | null
          graded_at?: string | null
          id?: string
          status?: string
          submission_url?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assignment_id?: string
          created_at?: string | null
          feedback?: string | null
          grade?: number | null
          graded_at?: string | null
          id?: string
          status?: string
          submission_url?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          active: boolean | null
          course_id: string
          created_at: string | null
          description: string | null
          difficulty: string
          due_date: string | null
          id: string
          points: number
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          course_id: string
          created_at?: string | null
          description?: string | null
          difficulty: string
          due_date?: string | null
          id?: string
          points?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          course_id?: string
          created_at?: string | null
          description?: string | null
          difficulty?: string
          due_date?: string | null
          id?: string
          points?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_articles: {
        Row: {
          author_avatar: string | null
          author_name: string
          category: string
          content: string | null
          created_at: string
          excerpt: string
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_published: boolean | null
          published_at: string | null
          read_time: number
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_avatar?: string | null
          author_name?: string
          category: string
          content?: string | null
          created_at?: string
          excerpt: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          read_time?: number
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_avatar?: string | null
          author_name?: string
          category?: string
          content?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          read_time?: number
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_prompt: string | null
          title: string
          tone: string | null
          topic: string | null
          updated_at: string
          user_id: string
          word_count: number | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_prompt?: string | null
          title: string
          tone?: string | null
          topic?: string | null
          updated_at?: string
          user_id: string
          word_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_prompt?: string | null
          title?: string
          tone?: string | null
          topic?: string | null
          updated_at?: string
          user_id?: string
          word_count?: number | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          folder_id: string | null
          id: string
          pinned: boolean | null
          pinned_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          folder_id?: string | null
          id?: string
          pinned?: boolean | null
          pinned_at?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          folder_id?: string | null
          id?: string
          pinned?: boolean | null
          pinned_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "chat_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_folders: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_transfers: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          messages: Json
          session_id: string
          status: string
          updated_at: string
          user_email: string | null
          user_name: string | null
          user_phone: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          messages?: Json
          session_id: string
          status?: string
          updated_at?: string
          user_email?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          messages?: Json
          session_id?: string
          status?: string
          updated_at?: string
          user_email?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Relationships: []
      }
      client_onboarding: {
        Row: {
          budget_range: string
          company_name: string
          company_size: string | null
          completed_at: string | null
          contact_name: string
          created_at: string
          current_step: number | null
          documents: Json | null
          email: string
          id: string
          industry: string | null
          key_features: Json | null
          meeting_description: string | null
          meeting_link: string | null
          meeting_notes: string | null
          meeting_provider: string | null
          meeting_scheduled_at: string | null
          meeting_scheduled_by: string | null
          meeting_title: string | null
          nda_agreed: boolean
          nda_signature: string | null
          nda_signed_at: string | null
          nda_signer_name: string | null
          phone: string
          preferred_meeting_dates: Json | null
          project_description: string
          project_type: string
          status: string
          target_audience: string | null
          technical_requirements: Json | null
          timeline: string
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          budget_range: string
          company_name: string
          company_size?: string | null
          completed_at?: string | null
          contact_name: string
          created_at?: string
          current_step?: number | null
          documents?: Json | null
          email: string
          id?: string
          industry?: string | null
          key_features?: Json | null
          meeting_description?: string | null
          meeting_link?: string | null
          meeting_notes?: string | null
          meeting_provider?: string | null
          meeting_scheduled_at?: string | null
          meeting_scheduled_by?: string | null
          meeting_title?: string | null
          nda_agreed?: boolean
          nda_signature?: string | null
          nda_signed_at?: string | null
          nda_signer_name?: string | null
          phone: string
          preferred_meeting_dates?: Json | null
          project_description: string
          project_type: string
          status?: string
          target_audience?: string | null
          technical_requirements?: Json | null
          timeline: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          budget_range?: string
          company_name?: string
          company_size?: string | null
          completed_at?: string | null
          contact_name?: string
          created_at?: string
          current_step?: number | null
          documents?: Json | null
          email?: string
          id?: string
          industry?: string | null
          key_features?: Json | null
          meeting_description?: string | null
          meeting_link?: string | null
          meeting_notes?: string | null
          meeting_provider?: string | null
          meeting_scheduled_at?: string | null
          meeting_scheduled_by?: string | null
          meeting_title?: string | null
          nda_agreed?: boolean
          nda_signature?: string | null
          nda_signed_at?: string | null
          nda_signer_name?: string | null
          phone?: string
          preferred_meeting_dates?: Json | null
          project_description?: string
          project_type?: string
          status?: string
          target_audience?: string | null
          technical_requirements?: Json | null
          timeline?: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          message: string
          status: string | null
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          message: string
          status?: string | null
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string
          status?: string | null
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          course_id: string
          enrolled_at: string | null
          id: string
          last_accessed: string | null
          progress: number | null
          user_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string | null
          id?: string
          last_accessed?: string | null
          progress?: number | null
          user_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string | null
          id?: string
          last_accessed?: string | null
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          active: boolean | null
          assignments_count: number | null
          category: string
          created_at: string | null
          description: string
          difficulty: string
          duration: string
          id: string
          image_url: string | null
          instructor_name: string
          lessons_count: number | null
          price: string
          rating: number | null
          students_count: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          assignments_count?: number | null
          category: string
          created_at?: string | null
          description: string
          difficulty: string
          duration: string
          id?: string
          image_url?: string | null
          instructor_name: string
          lessons_count?: number | null
          price: string
          rating?: number | null
          students_count?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          assignments_count?: number | null
          category?: string
          created_at?: string | null
          description?: string
          difficulty?: string
          duration?: string
          id?: string
          image_url?: string | null
          instructor_name?: string
          lessons_count?: number | null
          price?: string
          rating?: number | null
          students_count?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      domain_verifications: {
        Row: {
          created_at: string
          domain_name: string
          id: string
          status: string
          updated_at: string
          verification_token: string
          verification_type: string
          verification_value: string | null
          verified_at: string | null
          website_id: string
        }
        Insert: {
          created_at?: string
          domain_name: string
          id?: string
          status?: string
          updated_at?: string
          verification_token: string
          verification_type: string
          verification_value?: string | null
          verified_at?: string | null
          website_id: string
        }
        Update: {
          created_at?: string
          domain_name?: string
          id?: string
          status?: string
          updated_at?: string
          verification_token?: string
          verification_type?: string
          verification_value?: string | null
          verified_at?: string | null
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "domain_verifications_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      email_tracking_events: {
        Row: {
          created_at: string | null
          email_address: string
          email_id: string
          event_type: string
          id: string
          ip_address: string | null
          link_url: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          email_address: string
          email_id: string
          event_type: string
          id?: string
          ip_address?: string | null
          link_url?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          email_address?: string
          email_id?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          link_url?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      generated_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          prompt: string
          quality: string
          size: string
          style: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          prompt: string
          quality: string
          size: string
          style: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          prompt?: string
          quality?: string
          size?: string
          style?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      google_oauth_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          refresh_token: string | null
          updated_at: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          refresh_token?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          budget: string | null
          created_at: string
          email: string
          id: string
          last_contacted: string | null
          name: string
          notes: string | null
          phone: string
          requirement: string
          source: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          budget?: string | null
          created_at?: string
          email: string
          id?: string
          last_contacted?: string | null
          name: string
          notes?: string | null
          phone: string
          requirement: string
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          budget?: string | null
          created_at?: string
          email?: string
          id?: string
          last_contacted?: string | null
          name?: string
          notes?: string | null
          phone?: string
          requirement?: string
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean | null
          id: string
          last_accessed: string | null
          lesson_id: string
          progress_percentage: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          id?: string
          last_accessed?: string | null
          lesson_id: string
          progress_percentage?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          id?: string
          last_accessed?: string | null
          lesson_id?: string
          progress_percentage?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          active: boolean | null
          content: string
          course_id: string
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          is_free: boolean | null
          order_number: number
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          active?: boolean | null
          content: string
          course_id: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_free?: boolean | null
          order_number: number
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          active?: boolean | null
          content?: string
          course_id?: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_free?: boolean | null
          order_number?: number
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number
          id: string
          meeting_link: string
          meeting_provider: string
          onboarding_id: string
          scheduled_time: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          meeting_link: string
          meeting_provider: string
          onboarding_id: string
          scheduled_time: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          meeting_link?: string
          meeting_provider?: string
          onboarding_id?: string
          scheduled_time?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_events_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "client_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          id: string
          inserted_at: string | null
          metadata: Json | null
          room_id: string
          user_id: string
        }
        Insert: {
          content: string
          id?: string
          inserted_at?: string | null
          metadata?: Json | null
          room_id: string
          user_id: string
        }
        Update: {
          content?: string
          id?: string
          inserted_at?: string | null
          metadata?: Json | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_messages: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean
          message: string
          onboarding_id: string
          read: boolean
          sender_email: string
          sender_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin?: boolean
          message: string
          onboarding_id: string
          read?: boolean
          sender_email: string
          sender_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean
          message?: string
          onboarding_id?: string
          read?: boolean
          sender_email?: string
          sender_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_messages_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "client_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string | null
          id: string
          items: Json | null
          order_number: string
          shipping_address: Json | null
          status: string | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string | null
          id?: string
          items?: Json | null
          order_number: string
          shipping_address?: Json | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_address?: Json | null
          created_at?: string | null
          id?: string
          items?: Json | null
          order_number?: string
          shipping_address?: Json | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      page_content: {
        Row: {
          content: Json
          content_type: string
          created_at: string
          id: string
          is_active: boolean
          order_position: number
          page_id: string | null
          section_name: string
          updated_at: string
        }
        Insert: {
          content: Json
          content_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          order_position?: number
          page_id?: string | null
          section_name: string
          updated_at?: string
        }
        Update: {
          content?: Json
          content_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          order_position?: number
          page_id?: string | null
          section_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_content_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_published: boolean
          is_visible_footer: boolean
          is_visible_header: boolean
          name: string
          order_position: number
          path: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          is_visible_footer?: boolean
          is_visible_header?: boolean
          name: string
          order_position?: number
          path: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          is_visible_footer?: boolean
          is_visible_header?: boolean
          name?: string
          order_position?: number
          path?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          active: boolean | null
          category: string
          created_at: string
          description: string
          id: string
          image_url: string
          name: string
          order_position: number
          tech: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          category: string
          created_at?: string
          description: string
          id?: string
          image_url: string
          name: string
          order_position?: number
          tech: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          name?: string
          order_position?: number
          tech?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string | null
          description: string
          featured: boolean | null
          id: string
          image_url: string
          in_stock: boolean | null
          name: string
          price: number
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          featured?: boolean | null
          id?: string
          image_url: string
          in_stock?: boolean | null
          name: string
          price: number
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          featured?: boolean | null
          id?: string
          image_url?: string
          in_stock?: boolean | null
          name?: string
          price?: number
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          block_type: string | null
          blocked_at: string | null
          blocked_by: string | null
          blocked_reason: string | null
          blocked_until: string | null
          created_at: string
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          is_blocked: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          block_type?: string | null
          blocked_at?: string | null
          blocked_by?: string | null
          blocked_reason?: string | null
          blocked_until?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_blocked?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          block_type?: string | null
          blocked_at?: string | null
          blocked_by?: string | null
          blocked_reason?: string | null
          blocked_until?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_blocked?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      project_files: {
        Row: {
          content: string
          created_at: string
          file_path: string
          id: string
          language: string
          project_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          file_path: string
          id?: string
          language?: string
          project_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          file_path?: string
          id?: string
          language?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          github_connected: boolean | null
          github_repo_url: string | null
          id: string
          is_published: boolean | null
          name: string
          published_url: string | null
          template_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          github_connected?: boolean | null
          github_repo_url?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          published_url?: string | null
          template_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          github_connected?: boolean | null
          github_repo_url?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          published_url?: string | null
          template_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quote_history: {
        Row: {
          breakdown: Json | null
          created_at: string
          email: string | null
          features: Json | null
          id: string
          project_description: string | null
          project_type: string
          team_size: string | null
          technologies: Json | null
          timeline_weeks: number
          total_cost: number
          urgency: string | null
          user_id: string | null
        }
        Insert: {
          breakdown?: Json | null
          created_at?: string
          email?: string | null
          features?: Json | null
          id?: string
          project_description?: string | null
          project_type: string
          team_size?: string | null
          technologies?: Json | null
          timeline_weeks: number
          total_cost: number
          urgency?: string | null
          user_id?: string | null
        }
        Update: {
          breakdown?: Json | null
          created_at?: string
          email?: string | null
          features?: Json | null
          id?: string
          project_description?: string | null
          project_type?: string
          team_size?: string | null
          technologies?: Json | null
          timeline_weeks?: number
          total_cost?: number
          urgency?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          download_count: number | null
          external_url: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          mime_type: string | null
          resource_type: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          download_count?: number | null
          external_url?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          mime_type?: string | null
          resource_type?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          download_count?: number | null
          external_url?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          mime_type?: string | null
          resource_type?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      room_members: {
        Row: {
          joined_at: string | null
          role: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string | null
          role?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          joined_at?: string | null
          role?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          budget: string
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          project_description: string
          services: Json
          status: string | null
          timeline: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          budget: string
          created_at?: string
          email: string
          id?: string
          name: string
          phone: string
          project_description: string
          services: Json
          status?: string | null
          timeline: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          budget?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          project_description?: string
          services?: Json
          status?: string | null
          timeline?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      signal_sessions: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          remote_user_id: string
          session_data: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          remote_user_id: string
          session_data: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          remote_user_id?: string
          session_data?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          active: boolean | null
          created_at: string
          id: string
          image_url: string | null
          name: string
          order_position: number | null
          rating: number
          role: string
          text: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          order_position?: number | null
          rating?: number
          role: string
          text: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          order_position?: number | null
          rating?: number
          role?: string
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_identity_keys: {
        Row: {
          created_at: string | null
          id: string
          identity_key_private: string
          identity_key_public: string
          registration_id: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          identity_key_private: string
          identity_key_public: string
          registration_id: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          identity_key_private?: string
          identity_key_public?: string
          registration_id?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_payment_settings: {
        Row: {
          created_at: string | null
          id: string
          payment_enabled: boolean | null
          stripe_publishable_key: string | null
          stripe_secret_key: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          payment_enabled?: boolean | null
          stripe_publishable_key?: string | null
          stripe_secret_key?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_enabled?: boolean | null
          stripe_publishable_key?: string | null
          stripe_secret_key?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_prekeys: {
        Row: {
          created_at: string | null
          id: string
          key_id: number
          private_key: string
          public_key: string
          used: boolean | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key_id: number
          private_key: string
          public_key: string
          used?: boolean | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key_id?: number
          private_key?: string
          public_key?: string
          used?: boolean | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          id: string
          role: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          role?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_signed_prekeys: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          key_id: number
          private_key: string
          public_key: string
          signature: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          key_id: number
          private_key: string
          public_key: string
          signature: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          key_id?: number
          private_key?: string
          public_key?: string
          signature?: string
          user_id?: string
        }
        Relationships: []
      }
      website_requests: {
        Row: {
          created_at: string
          details: string
          email: string
          id: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details: string
          email: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: string
          email?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      websites: {
        Row: {
          created_at: string
          description: string | null
          dns_configured: boolean | null
          domain_name: string | null
          domain_status: string | null
          domain_verified_at: string | null
          generated_content: Json | null
          id: string
          name: string
          ssl_enabled: boolean | null
          theme: string
          topic: string
          updated_at: string
          user_id: string
          verification_token: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          dns_configured?: boolean | null
          domain_name?: string | null
          domain_status?: string | null
          domain_verified_at?: string | null
          generated_content?: Json | null
          id?: string
          name: string
          ssl_enabled?: boolean | null
          theme: string
          topic: string
          updated_at?: string
          user_id: string
          verification_token?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          dns_configured?: boolean | null
          domain_name?: string | null
          domain_status?: string | null
          domain_verified_at?: string | null
          generated_content?: Json | null
          id?: string
          name?: string
          ssl_enabled?: boolean | null
          theme?: string
          topic?: string
          updated_at?: string
          user_id?: string
          verification_token?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_activity_logs: { Args: never; Returns: undefined }
      generate_verification_token: { Args: never; Returns: string }
      get_analytics_summary: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          daily_stats: Json
          device_breakdown: Json
          form_submissions: number
          page_views: number
          top_events: Json
          top_pages: Json
          total_events: number
          unique_visitors: number
        }[]
      }
      get_current_user_role: { Args: never; Returns: string }
      get_user_orders: {
        Args: { p_user_id?: string }
        Returns: {
          billing_address: Json | null
          created_at: string | null
          id: string
          items: Json | null
          order_number: string
          shipping_address: Json | null
          status: string | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      is_user_blocked: { Args: { user_id: string }; Returns: boolean }
      log_order_access: {
        Args: { p_action: string; p_details?: Json; p_order_id: string }
        Returns: undefined
      }
      secure_insert_order: {
        Args: {
          p_billing_address: Json
          p_items: Json
          p_shipping_address: Json
          p_status: string
          p_total_amount: number
          p_user_id: string
        }
        Returns: string
      }
      secure_update_order: {
        Args: {
          p_billing_address?: Json
          p_order_id: string
          p_shipping_address?: Json
          p_status?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
