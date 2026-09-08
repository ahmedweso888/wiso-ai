REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.access_state(UUID) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_access_platform(UUID) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ensure_profile(TEXT) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.access_state(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_platform(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_profile(TEXT) TO authenticated;

CREATE TYPE public.difficulty_level AS ENUM ('basic','medium','hard','very_hard','nightmare');
CREATE TYPE public.doc_status AS ENUM ('uploaded','processing','processed','failed');
CREATE TYPE public.question_type AS ENUM (
  'mcq','true_false','short_answer','explain_why','compare','problem_solving',
  'error_detection','output_prediction','coding','debugging','algorithm_design',
  'mixed_concept','trap');
CREATE TYPE public.validation_status AS ENUM ('pending','validating','approved','rejected');
CREATE TYPE public.mistake_type AS ENUM (
  'knowledge_gap','careless','misunderstanding','calculation','logic','reading',
  'misconception','coding_error','syntax_error','algorithmic_error');
CREATE TYPE public.plan_phase AS ENUM ('syllabus','revision');

-- SUBJECTS (global reference data)
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'chart-1',
  icon TEXT NOT NULL DEFAULT 'book-open',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subjects TO authenticated;
GRANT ALL ON public.subjects TO service_role;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subjects readable" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage subjects" ON public.subjects FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.subjects (slug, name_ar, name_en, color, icon, sort_order) VALUES
  ('arabic','اللغة العربية','Arabic','chart-1','languages',1),
  ('egyptian-history','التاريخ المصري','Egyptian History','chart-2','landmark',2),
  ('english','اللغة الإنجليزية','English','chart-3','book-open',3),
  ('python','برمجة — Python','Programming — Python','chart-4','terminal',4),
  ('javascript','برمجة — JavaScript','Programming — JavaScript','chart-5','braces',5);

-- DOCUMENTS
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects ON DELETE SET NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'textbook',
  mime_type TEXT,
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  page_count INTEGER,
  status public.doc_status NOT NULL DEFAULT 'uploaded',
  processing_progress INTEGER NOT NULL DEFAULT 0,
  processing_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own documents" ON public.documents FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins read documents" ON public.documents FOR SELECT TO authenticated USING (public.is_admin());
CREATE TRIGGER trg_documents_updated BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.document_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  extracted_text TEXT,
  status public.doc_status NOT NULL DEFAULT 'uploaded',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (document_id, page_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_pages TO authenticated;
GRANT ALL ON public.document_pages TO service_role;
ALTER TABLE public.document_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pages" ON public.document_pages FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- SYLLABUS HIERARCHY (per user, extracted from their own materials)
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  source_document_id UUID REFERENCES public.documents ON DELETE SET NULL,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  source_document_id UUID REFERENCES public.documents ON DELETE SET NULL,
  source_page_from INTEGER,
  source_page_to INTEGER,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects ON DELETE CASCADE,
  title TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL DEFAULT 45,
  sort_order INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty public.difficulty_level NOT NULL DEFAULT 'medium',
  source_document_id UUID REFERENCES public.documents ON DELETE SET NULL,
  source_page INTEGER,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.learning_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  concept_id UUID REFERENCES public.concepts ON DELETE CASCADE,
  statement TEXT NOT NULL,
  bloom_level TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics ON DELETE SET NULL,
  document_id UUID REFERENCES public.documents ON DELETE SET NULL,
  title TEXT NOT NULL,
  summary TEXT,
  status public.doc_status NOT NULL DEFAULT 'uploaded',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- STUDY PLANS
CREATE TABLE public.study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'خطة إتمام المنهج',
  deadline DATE NOT NULL DEFAULT DATE '2027-01-01',
  daily_hours_target NUMERIC(4,1) NOT NULL DEFAULT 4,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.study_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.study_plans ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  parent_id UUID REFERENCES public.study_plan_items ON DELETE CASCADE,
  level TEXT NOT NULL DEFAULT 'day',
  phase public.plan_phase NOT NULL DEFAULT 'syllabus',
  subject_id UUID REFERENCES public.subjects ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics ON DELETE SET NULL,
  title TEXT NOT NULL,
  notes TEXT,
  starts_on DATE,
  ends_on DATE,
  estimated_minutes INTEGER NOT NULL DEFAULT 60,
  question_target INTEGER NOT NULL DEFAULT 0,
  target_difficulty public.difficulty_level NOT NULL DEFAULT 'hard',
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- QUESTIONS
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  question_type public.question_type NOT NULL DEFAULT 'mcq',
  difficulty public.difficulty_level NOT NULL DEFAULT 'hard',
  difficulty_score NUMERIC(4,2) NOT NULL DEFAULT 0,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT,
  explanation TEXT,
  common_trap TEXT,
  estimated_time_seconds INTEGER NOT NULL DEFAULT 120,
  language TEXT NOT NULL DEFAULT 'ar',
  ai_generated BOOLEAN NOT NULL DEFAULT true,
  ai_model TEXT,
  validation_status public.validation_status NOT NULL DEFAULT 'pending',
  validation_notes JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  reported BOOLEAN NOT NULL DEFAULT false,
  report_reason TEXT,
  times_attempted INTEGER NOT NULL DEFAULT 0,
  times_correct INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.question_concepts (
  question_id UUID NOT NULL REFERENCES public.questions ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES public.concepts ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  PRIMARY KEY (question_id, concept_id)
);
CREATE TABLE public.question_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents ON DELETE SET NULL,
  page_number INTEGER,
  quote TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.question_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  answer_given TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  time_taken_seconds INTEGER NOT NULL DEFAULT 0,
  confidence INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions ON DELETE CASCADE,
  attempt_id UUID REFERENCES public.question_attempts ON DELETE SET NULL,
  concept_id UUID REFERENCES public.concepts ON DELETE SET NULL,
  subject_id UUID REFERENCES public.subjects ON DELETE SET NULL,
  mistake_type public.mistake_type NOT NULL DEFAULT 'knowledge_gap',
  answer_given TEXT,
  correct_answer TEXT,
  ai_analysis TEXT,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics ON DELETE CASCADE,
  concept_id UUID REFERENCES public.concepts ON DELETE CASCADE,
  mastery_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  accuracy NUMERIC(5,2) NOT NULL DEFAULT 0,
  questions_solved INTEGER NOT NULL DEFAULT 0,
  is_weak BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  questions_solved INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  hard_solved INTEGER NOT NULL DEFAULT 0,
  nightmare_solved INTEGER NOT NULL DEFAULT 0,
  study_minutes INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, day)
);
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  kind TEXT NOT NULL DEFAULT 'info',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  agent TEXT NOT NULL,
  model TEXT,
  status TEXT NOT NULL DEFAULT 'not_configured',
  tokens_used INTEGER NOT NULL DEFAULT 0,
  questions_generated INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- GRANTS + RLS for user-owned tables
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'units','chapters','topics','concepts','learning_objectives','lessons',
    'study_plans','study_plan_items','questions','question_concepts','question_sources',
    'question_attempts','mistakes','mastery','daily_progress','notifications','ai_usage_logs'
  ] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "own rows" ON public.%I FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())', t);
    EXECUTE format('CREATE POLICY "admins read" ON public.%I FOR SELECT TO authenticated USING (public.is_admin())', t);
  END LOOP;
END $$;

CREATE TRIGGER trg_plans_updated BEFORE UPDATE ON public.study_plans
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_plan_items_updated BEFORE UPDATE ON public.study_plan_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_questions_updated BEFORE UPDATE ON public.questions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_mastery_updated BEFORE UPDATE ON public.mastery
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_questions_user ON public.questions (user_id, subject_id, difficulty);
CREATE INDEX idx_attempts_user ON public.question_attempts (user_id, created_at DESC);
CREATE INDEX idx_mistakes_user ON public.mistakes (user_id, created_at DESC);
CREATE INDEX idx_plan_items_user ON public.study_plan_items (user_id, starts_on);
CREATE INDEX idx_daily_user ON public.daily_progress (user_id, day DESC);