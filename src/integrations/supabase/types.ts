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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          id: string
          metadata: Json
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          target_user_id?: string | null
        }
        Relationships: []
      }
      ai_settings: {
        Row: {
          ai_emergency_disabled: boolean
          ai_mode_enabled: boolean
          auto_routing_enabled: boolean
          daily_document_limit: number
          daily_question_limit: number
          daily_request_limit: number
          enabled: boolean
          fallback_enabled: boolean
          fallback_provider: string | null
          id: boolean
          max_tokens: number
          model: string
          model_a_enabled: boolean
          model_a_name: string
          model_a_provider: string
          model_b_enabled: boolean
          model_b_name: string
          model_b_provider: string
          monthly_request_limit: number
          provider: string
          temperature: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ai_emergency_disabled?: boolean
          ai_mode_enabled?: boolean
          auto_routing_enabled?: boolean
          daily_document_limit?: number
          daily_question_limit?: number
          daily_request_limit?: number
          enabled?: boolean
          fallback_enabled?: boolean
          fallback_provider?: string | null
          id?: boolean
          max_tokens?: number
          model?: string
          model_a_enabled?: boolean
          model_a_name?: string
          model_a_provider?: string
          model_b_enabled?: boolean
          model_b_name?: string
          model_b_provider?: string
          monthly_request_limit?: number
          provider?: string
          temperature?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ai_emergency_disabled?: boolean
          ai_mode_enabled?: boolean
          auto_routing_enabled?: boolean
          daily_document_limit?: number
          daily_question_limit?: number
          daily_request_limit?: number
          enabled?: boolean
          fallback_enabled?: boolean
          fallback_provider?: string | null
          id?: boolean
          max_tokens?: number
          model?: string
          model_a_enabled?: boolean
          model_a_name?: string
          model_a_provider?: string
          model_b_enabled?: boolean
          model_b_name?: string
          model_b_provider?: string
          monthly_request_limit?: number
          provider?: string
          temperature?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          agent: string
          created_at: string
          documents_analyzed: number
          error: string | null
          id: string
          images_analyzed: number
          latency_ms: number | null
          model: string | null
          provider: string | null
          questions_generated: number
          status: string
          tokens_used: number
          user_id: string
        }
        Insert: {
          agent: string
          created_at?: string
          documents_analyzed?: number
          error?: string | null
          id?: string
          images_analyzed?: number
          latency_ms?: number | null
          model?: string | null
          provider?: string | null
          questions_generated?: number
          status?: string
          tokens_used?: number
          user_id: string
        }
        Update: {
          agent?: string
          created_at?: string
          documents_analyzed?: number
          error?: string | null
          id?: string
          images_analyzed?: number
          latency_ms?: number | null
          model?: string | null
          provider?: string | null
          questions_generated?: number
          status?: string
          tokens_used?: number
          user_id?: string
        }
        Relationships: []
      }
      chapters: {
        Row: {
          ai_generated: boolean
          created_at: string
          id: string
          sort_order: number
          source_document_id: string | null
          source_page_from: number | null
          source_page_to: number | null
          subject_id: string
          title: string
          unit_id: string | null
          user_id: string
        }
        Insert: {
          ai_generated?: boolean
          created_at?: string
          id?: string
          sort_order?: number
          source_document_id?: string | null
          source_page_from?: number | null
          source_page_to?: number | null
          subject_id: string
          title: string
          unit_id?: string | null
          user_id: string
        }
        Update: {
          ai_generated?: boolean
          created_at?: string
          id?: string
          sort_order?: number
          source_document_id?: string | null
          source_page_from?: number | null
          source_page_to?: number | null
          subject_id?: string
          title?: string
          unit_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapters_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      concepts: {
        Row: {
          ai_generated: boolean
          created_at: string
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          id: string
          source_document_id: string | null
          source_page: number | null
          subject_id: string
          title: string
          topic_id: string | null
          user_id: string
        }
        Insert: {
          ai_generated?: boolean
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          source_document_id?: string | null
          source_page?: number | null
          subject_id: string
          title: string
          topic_id?: string | null
          user_id: string
        }
        Update: {
          ai_generated?: boolean
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          source_document_id?: string | null
          source_page?: number | null
          subject_id?: string
          title?: string
          topic_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "concepts_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concepts_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concepts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_progress: {
        Row: {
          correct_answers: number
          created_at: string
          day: string
          hard_solved: number
          id: string
          nightmare_solved: number
          questions_solved: number
          study_minutes: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          correct_answers?: number
          created_at?: string
          day?: string
          hard_solved?: number
          id?: string
          nightmare_solved?: number
          questions_solved?: number
          study_minutes?: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          correct_answers?: number
          created_at?: string
          day?: string
          hard_solved?: number
          id?: string
          nightmare_solved?: number
          questions_solved?: number
          study_minutes?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      document_pages: {
        Row: {
          created_at: string
          document_id: string
          extracted_text: string | null
          id: string
          page_number: number
          status: Database["public"]["Enums"]["doc_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          document_id: string
          extracted_text?: string | null
          id?: string
          page_number: number
          status?: Database["public"]["Enums"]["doc_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          document_id?: string
          extracted_text?: string | null
          id?: string
          page_number?: number
          status?: Database["public"]["Enums"]["doc_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_pages_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          file_size: number | null
          id: string
          kind: string
          mime_type: string | null
          name: string
          page_count: number | null
          processing_error: string | null
          processing_progress: number
          status: Database["public"]["Enums"]["doc_status"]
          storage_path: string
          subject_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          id?: string
          kind?: string
          mime_type?: string | null
          name: string
          page_count?: number | null
          processing_error?: string | null
          processing_progress?: number
          status?: Database["public"]["Enums"]["doc_status"]
          storage_path: string
          subject_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_size?: number | null
          id?: string
          kind?: string
          mime_type?: string | null
          name?: string
          page_count?: number | null
          processing_error?: string | null
          processing_progress?: number
          status?: Database["public"]["Enums"]["doc_status"]
          storage_path?: string
          subject_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_objectives: {
        Row: {
          bloom_level: string | null
          concept_id: string | null
          created_at: string
          id: string
          statement: string
          user_id: string
        }
        Insert: {
          bloom_level?: string | null
          concept_id?: string | null
          created_at?: string
          id?: string
          statement: string
          user_id: string
        }
        Update: {
          bloom_level?: string | null
          concept_id?: string | null
          created_at?: string
          id?: string
          statement?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_objectives_concept_id_fkey"
            columns: ["concept_id"]
            isOneToOne: false
            referencedRelation: "concepts"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string
          document_id: string | null
          id: string
          status: Database["public"]["Enums"]["doc_status"]
          subject_id: string
          summary: string | null
          title: string
          topic_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["doc_status"]
          subject_id: string
          summary?: string | null
          title: string
          topic_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          document_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["doc_status"]
          subject_id?: string
          summary?: string | null
          title?: string
          topic_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      mastery: {
        Row: {
          accuracy: number
          concept_id: string | null
          created_at: string
          id: string
          is_weak: boolean
          mastery_score: number
          questions_solved: number
          subject_id: string | null
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy?: number
          concept_id?: string | null
          created_at?: string
          id?: string
          is_weak?: boolean
          mastery_score?: number
          questions_solved?: number
          subject_id?: string | null
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy?: number
          concept_id?: string | null
          created_at?: string
          id?: string
          is_weak?: boolean
          mastery_score?: number
          questions_solved?: number
          subject_id?: string | null
          topic_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mastery_concept_id_fkey"
            columns: ["concept_id"]
            isOneToOne: false
            referencedRelation: "concepts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mastery_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mastery_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      mistakes: {
        Row: {
          ai_analysis: string | null
          answer_given: string | null
          attempt_id: string | null
          concept_id: string | null
          correct_answer: string | null
          created_at: string
          id: string
          mistake_type: Database["public"]["Enums"]["mistake_type"]
          question_id: string | null
          resolved: boolean
          subject_id: string | null
          user_id: string
        }
        Insert: {
          ai_analysis?: string | null
          answer_given?: string | null
          attempt_id?: string | null
          concept_id?: string | null
          correct_answer?: string | null
          created_at?: string
          id?: string
          mistake_type?: Database["public"]["Enums"]["mistake_type"]
          question_id?: string | null
          resolved?: boolean
          subject_id?: string | null
          user_id: string
        }
        Update: {
          ai_analysis?: string | null
          answer_given?: string | null
          attempt_id?: string | null
          concept_id?: string | null
          correct_answer?: string | null
          created_at?: string
          id?: string
          mistake_type?: Database["public"]["Enums"]["mistake_type"]
          question_id?: string | null
          resolved?: boolean
          subject_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mistakes_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "question_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mistakes_concept_id_fkey"
            columns: ["concept_id"]
            isOneToOne: false
            referencedRelation: "concepts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mistakes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mistakes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          id: boolean
          instructions: string
          max_screenshot_mb: number
          method_name: string
          payment_number: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: boolean
          instructions?: string
          max_screenshot_mb?: number
          method_name?: string
          payment_number?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: boolean
          instructions?: string
          max_screenshot_mb?: number
          method_name?: string
          payment_number?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          global_access_enabled: boolean
          global_access_end: string | null
          global_access_start: string | null
          id: boolean
          maintenance_message: string | null
          maintenance_mode: boolean
          platform_status: Database["public"]["Enums"]["platform_status"]
          updated_at: string
        }
        Insert: {
          global_access_enabled?: boolean
          global_access_end?: string | null
          global_access_start?: string | null
          id?: boolean
          maintenance_message?: string | null
          maintenance_mode?: boolean
          platform_status?: Database["public"]["Enums"]["platform_status"]
          updated_at?: string
        }
        Update: {
          global_access_enabled?: boolean
          global_access_end?: string | null
          global_access_start?: string | null
          id?: boolean
          maintenance_message?: string | null
          maintenance_mode?: boolean
          platform_status?: Database["public"]["Enums"]["platform_status"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          access_expires_at: string | null
          access_granted_at: string | null
          access_override: Database["public"]["Enums"]["access_override"]
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_active_at: string
          locale: string
          permanent_access: boolean
          platform_access_status: Database["public"]["Enums"]["platform_access_status"]
          streak_days: number
          subscription_expires_at: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          suspended_at: string | null
          suspended_reason: string | null
          trial_expires_at: string
          trial_started_at: string
          updated_at: string
          user_code: number
          xp: number
        }
        Insert: {
          access_expires_at?: string | null
          access_granted_at?: string | null
          access_override?: Database["public"]["Enums"]["access_override"]
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          last_active_at?: string
          locale?: string
          permanent_access?: boolean
          platform_access_status?: Database["public"]["Enums"]["platform_access_status"]
          streak_days?: number
          subscription_expires_at?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          suspended_at?: string | null
          suspended_reason?: string | null
          trial_expires_at?: string
          trial_started_at?: string
          updated_at?: string
          user_code?: number
          xp?: number
        }
        Update: {
          access_expires_at?: string | null
          access_granted_at?: string | null
          access_override?: Database["public"]["Enums"]["access_override"]
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          last_active_at?: string
          locale?: string
          permanent_access?: boolean
          platform_access_status?: Database["public"]["Enums"]["platform_access_status"]
          streak_days?: number
          subscription_expires_at?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          suspended_at?: string | null
          suspended_reason?: string | null
          trial_expires_at?: string
          trial_started_at?: string
          updated_at?: string
          user_code?: number
          xp?: number
        }
        Relationships: []
      }
      question_attempts: {
        Row: {
          answer_given: string | null
          confidence: number | null
          created_at: string
          id: string
          is_correct: boolean
          question_id: string
          time_taken_seconds: number
          user_id: string
        }
        Insert: {
          answer_given?: string | null
          confidence?: number | null
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id: string
          time_taken_seconds?: number
          user_id: string
        }
        Update: {
          answer_given?: string | null
          confidence?: number | null
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          time_taken_seconds?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_concepts: {
        Row: {
          concept_id: string
          question_id: string
          user_id: string
        }
        Insert: {
          concept_id: string
          question_id: string
          user_id: string
        }
        Update: {
          concept_id?: string
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_concepts_concept_id_fkey"
            columns: ["concept_id"]
            isOneToOne: false
            referencedRelation: "concepts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_concepts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_sources: {
        Row: {
          created_at: string
          document_id: string | null
          id: string
          page_number: number | null
          question_id: string
          quote: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          id?: string
          page_number?: number | null
          question_id: string
          quote?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          document_id?: string | null
          id?: string
          page_number?: number | null
          question_id?: string
          quote?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_sources_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_sources_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          ai_generated: boolean
          ai_model: string | null
          common_trap: string | null
          correct_answer: string | null
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          difficulty_score: number
          estimated_time_seconds: number
          explanation: string | null
          id: string
          is_favorite: boolean
          language: string
          options: Json
          prompt: string
          question_type: Database["public"]["Enums"]["question_type"]
          report_reason: string | null
          reported: boolean
          subject_id: string
          times_attempted: number
          times_correct: number
          topic_id: string | null
          updated_at: string
          user_id: string
          validation_notes: Json
          validation_status: Database["public"]["Enums"]["validation_status"]
        }
        Insert: {
          ai_generated?: boolean
          ai_model?: string | null
          common_trap?: string | null
          correct_answer?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          difficulty_score?: number
          estimated_time_seconds?: number
          explanation?: string | null
          id?: string
          is_favorite?: boolean
          language?: string
          options?: Json
          prompt: string
          question_type?: Database["public"]["Enums"]["question_type"]
          report_reason?: string | null
          reported?: boolean
          subject_id: string
          times_attempted?: number
          times_correct?: number
          topic_id?: string | null
          updated_at?: string
          user_id: string
          validation_notes?: Json
          validation_status?: Database["public"]["Enums"]["validation_status"]
        }
        Update: {
          ai_generated?: boolean
          ai_model?: string | null
          common_trap?: string | null
          correct_answer?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          difficulty_score?: number
          estimated_time_seconds?: number
          explanation?: string | null
          id?: string
          is_favorite?: boolean
          language?: string
          options?: Json
          prompt?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          report_reason?: string | null
          reported?: boolean
          subject_id?: string
          times_attempted?: number
          times_correct?: number
          topic_id?: string | null
          updated_at?: string
          user_id?: string
          validation_notes?: Json
          validation_status?: Database["public"]["Enums"]["validation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      student_subscriptions: {
        Row: {
          activated_at: string
          activated_by: string | null
          created_at: string
          expires_at: string | null
          id: string
          plan_id: string
          revoked_at: string | null
          revoked_reason: string | null
          source_request_id: string | null
          started_at: string
          status: Database["public"]["Enums"]["student_sub_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          activated_at?: string
          activated_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_id: string
          revoked_at?: string | null
          revoked_reason?: string | null
          source_request_id?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["student_sub_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          activated_at?: string
          activated_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_id?: string
          revoked_at?: string | null
          revoked_reason?: string | null
          source_request_id?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["student_sub_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_subscriptions_source_request_id_fkey"
            columns: ["source_request_id"]
            isOneToOne: false
            referencedRelation: "subscription_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plan_items: {
        Row: {
          ai_generated: boolean
          completed: boolean
          completed_at: string | null
          created_at: string
          ends_on: string | null
          estimated_minutes: number
          id: string
          level: string
          notes: string | null
          parent_id: string | null
          phase: Database["public"]["Enums"]["plan_phase"]
          plan_id: string
          question_target: number
          sort_order: number
          starts_on: string | null
          subject_id: string | null
          target_difficulty: Database["public"]["Enums"]["difficulty_level"]
          title: string
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          ends_on?: string | null
          estimated_minutes?: number
          id?: string
          level?: string
          notes?: string | null
          parent_id?: string | null
          phase?: Database["public"]["Enums"]["plan_phase"]
          plan_id: string
          question_target?: number
          sort_order?: number
          starts_on?: string | null
          subject_id?: string | null
          target_difficulty?: Database["public"]["Enums"]["difficulty_level"]
          title: string
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          ends_on?: string | null
          estimated_minutes?: number
          id?: string
          level?: string
          notes?: string | null
          parent_id?: string | null
          phase?: Database["public"]["Enums"]["plan_phase"]
          plan_id?: string
          question_target?: number
          sort_order?: number
          starts_on?: string | null
          subject_id?: string | null
          target_difficulty?: Database["public"]["Enums"]["difficulty_level"]
          title?: string
          topic_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_plan_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "study_plan_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_plan_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "study_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_plan_items_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_plan_items_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plans: {
        Row: {
          ai_generated: boolean
          created_at: string
          daily_hours_target: number
          deadline: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean
          created_at?: string
          daily_hours_target?: number
          deadline?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean
          created_at?: string
          daily_hours_target?: number
          deadline?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          name_ar: string
          name_en: string
          slug: string
          sort_order: number
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name_ar: string
          name_en: string
          slug: string
          sort_order?: number
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name_ar?: string
          name_en?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          ai_enabled: boolean
          ai_model: Database["public"]["Enums"]["plan_ai_model"]
          created_at: string
          currency: string
          daily_image_limit: number
          daily_pdf_limit: number
          daily_question_limit: number
          description: string | null
          display_order: number
          features: Json
          id: string
          is_active: boolean
          max_images_per_request: number
          max_pdf_pages: number
          max_pdf_size_mb: number
          max_questions_per_request: number
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          ai_enabled?: boolean
          ai_model?: Database["public"]["Enums"]["plan_ai_model"]
          created_at?: string
          currency?: string
          daily_image_limit?: number
          daily_pdf_limit?: number
          daily_question_limit?: number
          description?: string | null
          display_order?: number
          features?: Json
          id?: string
          is_active?: boolean
          max_images_per_request?: number
          max_pdf_pages?: number
          max_pdf_size_mb?: number
          max_questions_per_request?: number
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          ai_enabled?: boolean
          ai_model?: Database["public"]["Enums"]["plan_ai_model"]
          created_at?: string
          currency?: string
          daily_image_limit?: number
          daily_pdf_limit?: number
          daily_question_limit?: number
          description?: string | null
          display_order?: number
          features?: Json
          id?: string
          is_active?: boolean
          max_images_per_request?: number
          max_pdf_pages?: number
          max_pdf_size_mb?: number
          max_questions_per_request?: number
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscription_request_audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          metadata: Json
          notes: string | null
          request_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          notes?: string | null
          request_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          notes?: string | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_request_audit_logs_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "subscription_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          payment_reference: string
          payment_screenshot_path: string
          plan_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["sub_request_status"]
          student_id: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          payment_reference: string
          payment_screenshot_path: string
          plan_id: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["sub_request_status"]
          student_id: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          payment_reference?: string
          payment_screenshot_path?: string
          plan_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["sub_request_status"]
          student_id?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_requests_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          granted_manually: boolean
          id: string
          plan: string
          provider: string | null
          provider_subscription_id: string | null
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          granted_manually?: boolean
          id?: string
          plan?: string
          provider?: string | null
          provider_subscription_id?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          granted_manually?: boolean
          id?: string
          plan?: string
          provider?: string | null
          provider_subscription_id?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          ai_generated: boolean
          chapter_id: string | null
          completed: boolean
          created_at: string
          estimated_minutes: number
          id: string
          sort_order: number
          subject_id: string
          title: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean
          chapter_id?: string | null
          completed?: boolean
          created_at?: string
          estimated_minutes?: number
          id?: string
          sort_order?: number
          subject_id: string
          title: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean
          chapter_id?: string | null
          completed?: boolean
          created_at?: string
          estimated_minutes?: number
          id?: string
          sort_order?: number
          subject_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          ai_generated: boolean
          created_at: string
          id: string
          sort_order: number
          source_document_id: string | null
          subject_id: string
          title: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean
          created_at?: string
          id?: string
          sort_order?: number
          source_document_id?: string | null
          subject_id: string
          title: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean
          created_at?: string
          id?: string
          sort_order?: number
          source_document_id?: string | null
          subject_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      access_state: { Args: { _user_id?: string }; Returns: Json }
      admin_ai_stats: { Args: never; Returns: Json }
      admin_approve_subscription_request: {
        Args: {
          _expires_at: string
          _id: string
          _notes?: string
          _replace_active?: boolean
        }
        Returns: {
          activated_at: string
          activated_by: string | null
          created_at: string
          expires_at: string | null
          id: string
          plan_id: string
          revoked_at: string | null
          revoked_reason: string | null
          source_request_id: string | null
          started_at: string
          status: Database["public"]["Enums"]["student_sub_status"]
          student_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "student_subscriptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_extend_student_subscription: {
        Args: { _days: number; _id: string }
        Returns: {
          activated_at: string
          activated_by: string | null
          created_at: string
          expires_at: string | null
          id: string
          plan_id: string
          revoked_at: string | null
          revoked_reason: string | null
          source_request_id: string | null
          started_at: string
          status: Database["public"]["Enums"]["student_sub_status"]
          student_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "student_subscriptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_grant_access: {
        Args: {
          _days?: number
          _extend?: boolean
          _permanent?: boolean
          _target: string
          _until?: string
        }
        Returns: {
          access_expires_at: string | null
          access_granted_at: string | null
          access_override: Database["public"]["Enums"]["access_override"]
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_active_at: string
          locale: string
          permanent_access: boolean
          platform_access_status: Database["public"]["Enums"]["platform_access_status"]
          streak_days: number
          subscription_expires_at: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          suspended_at: string | null
          suspended_reason: string | null
          trial_expires_at: string
          trial_started_at: string
          updated_at: string
          user_code: number
          xp: number
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_list_student_subscriptions: {
        Args: { _limit?: number }
        Returns: Json
      }
      admin_list_subscription_requests: {
        Args: {
          _limit?: number
          _status?: Database["public"]["Enums"]["sub_request_status"]
        }
        Returns: Json
      }
      admin_list_users: {
        Args: { _limit?: number; _search?: string }
        Returns: {
          access: Json
          access_expires_at: string
          access_override: Database["public"]["Enums"]["access_override"]
          ai_requests: number
          created_at: string
          email: string
          full_name: string
          id: string
          is_admin: boolean
          last_active_at: string
          permanent_access: boolean
          platform_access_status: Database["public"]["Enums"]["platform_access_status"]
          subscription_expires_at: string
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          suspended_at: string
          trial_expires_at: string
          trial_started_at: string
          user_code: number
        }[]
      }
      admin_log: {
        Args: { _action: string; _meta: Json; _target: string }
        Returns: undefined
      }
      admin_manage_trial: {
        Args: { _action: string; _hours?: number; _target: string }
        Returns: {
          access_expires_at: string | null
          access_granted_at: string | null
          access_override: Database["public"]["Enums"]["access_override"]
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_active_at: string
          locale: string
          permanent_access: boolean
          platform_access_status: Database["public"]["Enums"]["platform_access_status"]
          streak_days: number
          subscription_expires_at: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          suspended_at: string | null
          suspended_reason: string | null
          trial_expires_at: string
          trial_started_at: string
          updated_at: string
          user_code: number
          xp: number
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_reject_subscription_request: {
        Args: { _id: string; _reason: string }
        Returns: {
          admin_notes: string | null
          created_at: string
          id: string
          payment_reference: string
          payment_screenshot_path: string
          plan_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["sub_request_status"]
          student_id: string
          submitted_at: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "subscription_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_review_subscription_request: {
        Args: { _id: string; _notes?: string }
        Returns: {
          admin_notes: string | null
          created_at: string
          id: string
          payment_reference: string
          payment_screenshot_path: string
          plan_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["sub_request_status"]
          student_id: string
          submitted_at: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "subscription_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_revoke_access: {
        Args: { _target: string }
        Returns: {
          access_expires_at: string | null
          access_granted_at: string | null
          access_override: Database["public"]["Enums"]["access_override"]
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_active_at: string
          locale: string
          permanent_access: boolean
          platform_access_status: Database["public"]["Enums"]["platform_access_status"]
          streak_days: number
          subscription_expires_at: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          suspended_at: string | null
          suspended_reason: string | null
          trial_expires_at: string
          trial_started_at: string
          updated_at: string
          user_code: number
          xp: number
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_revoke_student_subscription: {
        Args: { _id: string; _reason?: string }
        Returns: {
          activated_at: string
          activated_by: string | null
          created_at: string
          expires_at: string | null
          id: string
          plan_id: string
          revoked_at: string | null
          revoked_reason: string | null
          source_request_id: string | null
          started_at: string
          status: Database["public"]["Enums"]["student_sub_status"]
          student_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "student_subscriptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_role: {
        Args: {
          _enabled: boolean
          _role: Database["public"]["Enums"]["app_role"]
          _target: string
        }
        Returns: undefined
      }
      admin_set_subscription: {
        Args: {
          _days?: number
          _plan?: string
          _status: Database["public"]["Enums"]["subscription_status"]
          _target: string
        }
        Returns: {
          access_expires_at: string | null
          access_granted_at: string | null
          access_override: Database["public"]["Enums"]["access_override"]
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_active_at: string
          locale: string
          permanent_access: boolean
          platform_access_status: Database["public"]["Enums"]["platform_access_status"]
          streak_days: number
          subscription_expires_at: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          suspended_at: string | null
          suspended_reason: string | null
          trial_expires_at: string
          trial_started_at: string
          updated_at: string
          user_code: number
          xp: number
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_suspended: {
        Args: { _reason?: string; _suspended: boolean; _target: string }
        Returns: {
          access_expires_at: string | null
          access_granted_at: string | null
          access_override: Database["public"]["Enums"]["access_override"]
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_active_at: string
          locale: string
          permanent_access: boolean
          platform_access_status: Database["public"]["Enums"]["platform_access_status"]
          streak_days: number
          subscription_expires_at: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          suspended_at: string | null
          suspended_reason: string | null
          trial_expires_at: string
          trial_started_at: string
          updated_at: string
          user_code: number
          xp: number
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_stats: { Args: never; Returns: Json }
      admin_update_ai_settings:
        | {
            Args: {
              _daily_document_limit?: number
              _daily_question_limit?: number
              _daily_request_limit?: number
              _enabled?: boolean
              _fallback_enabled?: boolean
              _fallback_provider?: string
              _max_tokens?: number
              _model?: string
              _monthly_request_limit?: number
              _provider?: string
              _temperature?: number
            }
            Returns: {
              ai_emergency_disabled: boolean
              ai_mode_enabled: boolean
              auto_routing_enabled: boolean
              daily_document_limit: number
              daily_question_limit: number
              daily_request_limit: number
              enabled: boolean
              fallback_enabled: boolean
              fallback_provider: string | null
              id: boolean
              max_tokens: number
              model: string
              model_a_enabled: boolean
              model_a_name: string
              model_a_provider: string
              model_b_enabled: boolean
              model_b_name: string
              model_b_provider: string
              monthly_request_limit: number
              provider: string
              temperature: number
              updated_at: string
              updated_by: string | null
            }
            SetofOptions: {
              from: "*"
              to: "ai_settings"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: {
              _ai_emergency_disabled?: boolean
              _ai_mode_enabled?: boolean
              _daily_document_limit?: number
              _daily_question_limit?: number
              _daily_request_limit?: number
              _enabled?: boolean
              _fallback_enabled?: boolean
              _fallback_provider?: string
              _max_tokens?: number
              _model?: string
              _monthly_request_limit?: number
              _provider?: string
              _temperature?: number
            }
            Returns: {
              ai_emergency_disabled: boolean
              ai_mode_enabled: boolean
              auto_routing_enabled: boolean
              daily_document_limit: number
              daily_question_limit: number
              daily_request_limit: number
              enabled: boolean
              fallback_enabled: boolean
              fallback_provider: string | null
              id: boolean
              max_tokens: number
              model: string
              model_a_enabled: boolean
              model_a_name: string
              model_a_provider: string
              model_b_enabled: boolean
              model_b_name: string
              model_b_provider: string
              monthly_request_limit: number
              provider: string
              temperature: number
              updated_at: string
              updated_by: string | null
            }
            SetofOptions: {
              from: "*"
              to: "ai_settings"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      admin_update_payment_settings: {
        Args: {
          _instructions?: string
          _max_mb?: number
          _method?: string
          _number?: string
        }
        Returns: {
          id: boolean
          instructions: string
          max_screenshot_mb: number
          method_name: string
          payment_number: string
          updated_at: string
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "payment_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_update_platform_settings: {
        Args: {
          _maintenance?: boolean
          _message?: string
          _status?: Database["public"]["Enums"]["platform_status"]
          _window_enabled?: boolean
          _window_end?: string
          _window_start?: string
        }
        Returns: {
          global_access_enabled: boolean
          global_access_end: string | null
          global_access_start: string | null
          id: boolean
          maintenance_message: string | null
          maintenance_mode: boolean
          platform_status: Database["public"]["Enums"]["platform_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "platform_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_upsert_plan: {
        Args: { _id?: string; _plan: Json }
        Returns: {
          ai_enabled: boolean
          ai_model: Database["public"]["Enums"]["plan_ai_model"]
          created_at: string
          currency: string
          daily_image_limit: number
          daily_pdf_limit: number
          daily_question_limit: number
          description: string | null
          display_order: number
          features: Json
          id: string
          is_active: boolean
          max_images_per_request: number
          max_pdf_pages: number
          max_pdf_size_mb: number
          max_questions_per_request: number
          name: string
          price: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "subscription_plans"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_user_detail: { Args: { _target: string }; Returns: Json }
      can_access_platform: { Args: { _user_id?: string }; Returns: boolean }
      cancel_my_subscription_request: {
        Args: { _id: string }
        Returns: {
          admin_notes: string | null
          created_at: string
          id: string
          payment_reference: string
          payment_screenshot_path: string
          plan_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["sub_request_status"]
          student_id: string
          submitted_at: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "subscription_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      claim_first_admin: { Args: never; Returns: boolean }
      ensure_profile: {
        Args: { _full_name?: string }
        Returns: {
          access_expires_at: string | null
          access_granted_at: string | null
          access_override: Database["public"]["Enums"]["access_override"]
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_active_at: string
          locale: string
          permanent_access: boolean
          platform_access_status: Database["public"]["Enums"]["platform_access_status"]
          streak_days: number
          subscription_expires_at: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          suspended_at: string | null
          suspended_reason: string | null
          trial_expires_at: string
          trial_started_at: string
          updated_at: string
          user_code: number
          xp: number
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      expire_due_subscriptions: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      my_subscription_state: { Args: never; Returns: Json }
      submit_subscription_request: {
        Args: {
          _payment_reference: string
          _plan_id: string
          _screenshot_path: string
        }
        Returns: {
          admin_notes: string | null
          created_at: string
          id: string
          payment_reference: string
          payment_screenshot_path: string
          plan_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["sub_request_status"]
          student_id: string
          submitted_at: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "subscription_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      access_override:
        | "default"
        | "trial"
        | "subscriber"
        | "admin_granted"
        | "suspended"
      app_role: "admin" | "user"
      difficulty_level: "basic" | "medium" | "hard" | "very_hard" | "nightmare"
      doc_status: "uploaded" | "processing" | "processed" | "failed"
      mistake_type:
        | "knowledge_gap"
        | "careless"
        | "misunderstanding"
        | "calculation"
        | "logic"
        | "reading"
        | "misconception"
        | "coding_error"
        | "syntax_error"
        | "algorithmic_error"
      plan_ai_model: "model_a" | "model_b"
      plan_phase: "syllabus" | "revision"
      platform_access_status: "allowed" | "suspended" | "expired"
      platform_status: "open" | "closed" | "maintenance"
      question_type:
        | "mcq"
        | "true_false"
        | "short_answer"
        | "explain_why"
        | "compare"
        | "problem_solving"
        | "error_detection"
        | "output_prediction"
        | "coding"
        | "debugging"
        | "algorithm_design"
        | "mixed_concept"
        | "trap"
      student_sub_status: "active" | "expired" | "revoked"
      sub_request_status:
        | "pending"
        | "under_review"
        | "approved"
        | "rejected"
        | "cancelled"
      subscription_status: "trial" | "active" | "expired" | "cancelled" | "none"
      validation_status: "pending" | "validating" | "approved" | "rejected"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      access_override: [
        "default",
        "trial",
        "subscriber",
        "admin_granted",
        "suspended",
      ],
      app_role: ["admin", "user"],
      difficulty_level: ["basic", "medium", "hard", "very_hard", "nightmare"],
      doc_status: ["uploaded", "processing", "processed", "failed"],
      mistake_type: [
        "knowledge_gap",
        "careless",
        "misunderstanding",
        "calculation",
        "logic",
        "reading",
        "misconception",
        "coding_error",
        "syntax_error",
        "algorithmic_error",
      ],
      plan_ai_model: ["model_a", "model_b"],
      plan_phase: ["syllabus", "revision"],
      platform_access_status: ["allowed", "suspended", "expired"],
      platform_status: ["open", "closed", "maintenance"],
      question_type: [
        "mcq",
        "true_false",
        "short_answer",
        "explain_why",
        "compare",
        "problem_solving",
        "error_detection",
        "output_prediction",
        "coding",
        "debugging",
        "algorithm_design",
        "mixed_concept",
        "trap",
      ],
      student_sub_status: ["active", "expired", "revoked"],
      sub_request_status: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "cancelled",
      ],
      subscription_status: ["trial", "active", "expired", "cancelled", "none"],
      validation_status: ["pending", "validating", "approved", "rejected"],
    },
  },
} as const
