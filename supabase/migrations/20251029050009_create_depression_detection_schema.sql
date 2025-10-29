/*
  # Depression Detection System Schema

  1. New Tables
    - `detection_sessions`
      - `id` (uuid, primary key) - Unique session identifier
      - `user_id` (uuid, nullable) - Optional user tracking
      - `depression_score` (numeric) - Probability score (0-100)
      - `detected_patterns` (jsonb) - Captured sign language patterns
      - `remedy_suggestions` (jsonb) - Suggested remedies based on score
      - `session_duration` (integer) - Duration in seconds
      - `created_at` (timestamptz) - Timestamp of detection
      
  2. Security
    - Enable RLS on `detection_sessions` table
    - Add policy for users to read their own sessions
    - Add policy for inserting new sessions
    
  3. Notes
    - Sessions can be anonymous (user_id null) or tracked
    - Patterns stored as JSON for flexibility
    - Remedies generated based on score thresholds
*/

CREATE TABLE IF NOT EXISTS detection_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  depression_score numeric NOT NULL CHECK (depression_score >= 0 AND depression_score <= 100),
  detected_patterns jsonb DEFAULT '[]'::jsonb,
  remedy_suggestions jsonb DEFAULT '[]'::jsonb,
  session_duration integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE detection_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sessions"
  ON detection_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert sessions"
  ON detection_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anonymous sessions are readable"
  ON detection_sessions
  FOR SELECT
  TO anon
  USING (user_id IS NULL);

CREATE INDEX IF NOT EXISTS idx_detection_sessions_user_id ON detection_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_detection_sessions_created_at ON detection_sessions(created_at DESC);