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
export type SubjectCategory = "stem" | "language" | "humanities" | "other";
export type TutorStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "suspended";

/** Reference data shapes used by the enrollment dropdowns. */
export type Curriculum = {
  id: string;
  code: string;
  name: string;
  country: string | null;
  sort_order: number;
};

export type ClassLevel = {
  id: string;
  curriculum_id: string;
  code: string;
  label: string;
  stage: string;
  sort_order: number;
};

export type Subject = {
  id: string;
  code: string;
  name: string;
  category: SubjectCategory;
  sort_order: number;
};

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
          grade_band: GradeBand | null;
          curriculum_id: string | null;
          class_level_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          full_name: string;
          grade_band?: GradeBand | null;
          curriculum_id: string;
          class_level_id: string;
        };
        Update: {
          full_name?: string;
          curriculum_id?: string;
          class_level_id?: string;
        };
        Relationships: [];
      };
      curricula: {
        Row: Curriculum & { is_active: boolean; created_at: string; updated_at: string };
        Insert: { code: string; name: string; country?: string | null; sort_order?: number };
        Update: { name?: string; is_active?: boolean; sort_order?: number };
        Relationships: [];
      };
      class_levels: {
        Row: ClassLevel & { is_active: boolean; created_at: string; updated_at: string };
        Insert: {
          curriculum_id: string;
          code: string;
          label: string;
          stage: string;
          sort_order?: number;
        };
        Update: { label?: string; stage?: string; is_active?: boolean; sort_order?: number };
        Relationships: [];
      };
      subjects: {
        Row: Subject & {
          is_bookable: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: { code: string; name: string; category: SubjectCategory; sort_order?: number };
        Update: { name?: string; is_bookable?: boolean; is_active?: boolean };
        Relationships: [];
      };
      enrollments: {
        Row: {
          id: string;
          parent_id: string | null;
          learner_id: string | null;
          parent_name: string;
          learner_name: string;
          grade_band: GradeBand | null;
          curriculum_id: string | null;
          class_level_id: string | null;
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
          grade_band?: GradeBand | null;
          curriculum_id: string;
          class_level_id: string;
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
          status: TutorStatus;
          email: string | null;
          phone: string | null;
          years_experience: number | null;
          qualifications: string | null;
          availability_note: string | null;
          base_location: string | null;
          travel_radius_km: number | null;
          submitted_at: string | null;
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
          email?: string | null;
          phone?: string | null;
          years_experience?: number | null;
          qualifications?: string | null;
          availability_note?: string | null;
          base_location?: string | null;
          travel_radius_km?: number | null;
          status?: TutorStatus;
          is_active?: boolean;
          submitted_at?: string | null;
        };
        Update: {
          full_name?: string;
          headline?: string | null;
          bio?: string | null;
          email?: string | null;
          phone?: string | null;
          years_experience?: number | null;
          qualifications?: string | null;
          availability_note?: string | null;
          base_location?: string | null;
          travel_radius_km?: number | null;
          status?: TutorStatus;
          is_active?: boolean;
          submitted_at?: string | null;
        };
        Relationships: [];
      };
      tutor_applications: {
        Row: {
          id: string;
          tutor_id: string;
          submitted_at: string;
          decision: TutorStatus | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          review_notes: string | null;
          created_at: string;
        };
        Insert: { tutor_id: string };
        Update: {
          decision?: TutorStatus;
          reviewed_by?: string | null;
          reviewed_at?: string;
          review_notes?: string | null;
        };
        Relationships: [];
      };
      tutor_subjects: {
        Row: { tutor_id: string; subject_id: string };
        Insert: { tutor_id: string; subject_id: string };
        Update: never;
        Relationships: [];
      };
      tutor_curricula: {
        Row: { tutor_id: string; curriculum_id: string };
        Insert: { tutor_id: string; curriculum_id: string };
        Update: never;
        Relationships: [];
      };
      tutor_class_levels: {
        Row: { tutor_id: string; class_level_id: string };
        Insert: { tutor_id: string; class_level_id: string };
        Update: never;
        Relationships: [];
      };
      tutor_availability: {
        Row: {
          id: string;
          tutor_id: string;
          weekday: number;
          start_time: string;
          end_time: string;
          created_at: string;
        };
        Insert: { tutor_id: string; weekday: number; start_time: string; end_time: string };
        Update: never;
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
