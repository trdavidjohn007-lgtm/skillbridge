-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search

-- Create custom types
CREATE TYPE competency_domain AS ENUM (
  'statistical',
  'technical',
  'digital_governance',
  'behavioural'
);

CREATE TYPE competency_level AS ENUM (
  'beginner',
  'intermediate',
  'advanced',
  'expert'
);

CREATE TYPE edge_relationship AS ENUM (
  'prerequisite',
  'related',
  'progression'
);

CREATE TYPE assessed_by AS ENUM (
  'self',
  'ai',
  'trainer'
);

CREATE TYPE learner_role AS ENUM (
  'super_admin',
  'dept_admin',
  'trainer',
  'learner'
);

CREATE TYPE path_status AS ENUM (
  'active',
  'completed',
  'paused'
);

CREATE TYPE node_status AS ENUM (
  'recommended',
  'enrolled',
  'in_progress',
  'completed'
);

CREATE TYPE course_source AS ENUM (
  'igot',
  'tpac'
);

CREATE TYPE question_type AS ENUM (
  'mcq',
  'true_false',
  'short_answer'
);

CREATE TYPE difficulty_level AS ENUM (
  'easy',
  'medium',
  'hard'
);

CREATE TYPE validation_status AS ENUM (
  'pending',
  'validated',
  'rejected'
);

CREATE TYPE question_origin AS ENUM (
  'ai',
  'trainer',
  'imported'
);

CREATE TYPE sync_type AS ENUM (
  'full',
  'incremental'
);

CREATE TYPE sync_status AS ENUM (
  'success',
  'partial',
  'failed'
);

CREATE TYPE gap_priority AS ENUM (
  'critical',
  'high',
  'medium',
  'low'
);
