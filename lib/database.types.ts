/**
 * Types mirroring supabase/migrations/20260803090000_init_auth_enrollments.sql
 *
 * Once your project is live you can regenerate this file from the real schema:
 *   npx supabase gen types typescript --project-id <ref> > lib/database.types.ts
 */

export type UserRole = "parent" | "learner" | "tutor" | "admin";
export type GradeBand = "primary" | "middle" | "upper";
export type EnrollmentStatus =
  | "new"
  | "contacted"
  | "matched"
  | "active"
  | "cancelled";
export type LessonFormat = "online" | "physical";
export type LessonStatus = "scheduled" | "completed" | "cancelled";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          phone?: string | null;
          role?: UserRole;
        };
        Update: {
          full_name?: string;
          phone?: string | null;
          role?: UserRole;
        };
        Relationships: [];
      };
      learners: {
        Row: {
          id: string;
          parent_id: string;
          full_name: string;
          grade_band: GradeBand;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          full_name: string;
          grade_band: GradeBand;
        };
        Update: {
          full_name?: string;
          grade_band?: GradeBand;
        };
        Relationships: [];
      };
      enrollments: {
        Row: {
          id: string;
          parent_id: string | null;
          learner_id: string | null;
          parent_name: string;
          learner_name: string;
          grade_band: GradeBand;
          subject: string | null;
          phone: string;
          status: EnrollmentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_id?: string | null;
          learner_id?: string | null;
          parent_name: string;
          learner_name: string;
          grade_band: GradeBand;
          subject?: string | null;
          phone: string;
          status?: EnrollmentStatus;
        };
        Update: {
          status?: EnrollmentStatus;
        };
        Relationships: [];
      };
      tutors: {
        Row: {
          id: string;
          profile_id: string | null;
          full_name: string;
          headline: string | null;
          bio: string | null;
          subjects: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          full_name: string;
          headline?: string | null;
          bio?: string | null;
          subjects?: string[];
          is_active?: boolean;
        };
        Update: {
          full_name?: string;
          headline?: string | null;
          bio?: string | null;
          subjects?: string[];
          is_active?: boolean;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          learner_id: string;
          tutor_id: string | null;
          subject: string;
          starts_at: string;
          duration_minutes: number;
          format: LessonFormat;
          location: string | null;
          meeting_url: string | null;
          status: LessonStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          learner_id: string;
          tutor_id?: string | null;
          subject: string;
          starts_at: string;
          duration_minutes?: number;
          format?: LessonFormat;
          location?: string | null;
          meeting_url?: string | null;
          status?: LessonStatus;
          notes?: string | null;
        };
        Update: {
          tutor_id?: string | null;
          subject?: string;
          starts_at?: string;
          duration_minutes?: number;
          format?: LessonFormat;
          location?: string | null;
          meeting_url?: string | null;
          status?: LessonStatus;
          notes?: string | null;
        };
        Relationships: [];
      };
      assessments: {
        Row: {
          id: string;
          learner_id: string;
          subject: string;
          title: string;
          term: string | null;
          score: number | null;
          max_score: number | null;
          grade: string | null;
          assessed_on: string;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          learner_id: string;
          subject: string;
          title: string;
          term?: string | null;
          score?: number | null;
          max_score?: number | null;
          grade?: string | null;
          assessed_on?: string;
          comment?: string | null;
        };
        Update: {
          subject?: string;
          title?: string;
          term?: string | null;
          score?: number | null;
          max_score?: number | null;
          grade?: string | null;
          assessed_on?: string;
          comment?: string | null;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          parent_id: string;
          subject: string | null;
          last_message_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          subject?: string | null;
        };
        Update: {
          subject?: string | null;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          conversation_id: string;
          sender_id: string;
          body: string;
        };
        Update: {
          read_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      owns_learner: {
        Args: { p_learner_id: string };
        Returns: boolean;
      };
      in_conversation: {
        Args: { p_conversation_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      grade_band: GradeBand;
      enrollment_status: EnrollmentStatus;
      lesson_format: LessonFormat;
      lesson_status: LessonStatus;
    };
    CompositeTypes: Record<never, never>;
  };
};
