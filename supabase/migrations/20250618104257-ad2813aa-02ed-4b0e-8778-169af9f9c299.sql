
-- Drop the existing table and recreate with the correct structure
DROP TABLE IF EXISTS public.who_standards;

-- Create table matching your CSV structure
CREATE TABLE public.who_standards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parameter TEXT NOT NULL, -- 'weight', 'height', 'head_circumference', 'arm_circumference', 'bmi'
  gender TEXT NOT NULL, -- 'male' or 'female'
  age_days INTEGER NOT NULL, -- age in days
  l DECIMAL(10,6), -- L parameter (lambda/skewness)
  m DECIMAL(10,6) NOT NULL, -- M parameter (median/mean)
  s DECIMAL(10,6), -- S parameter (coefficient of variation)
  sd4neg DECIMAL(10,4), -- -4 SD
  sd3neg DECIMAL(10,4), -- -3 SD
  sd2neg DECIMAL(10,4), -- -2 SD
  sd1neg DECIMAL(10,4), -- -1 SD
  sd0 DECIMAL(10,4), -- median
  sd1 DECIMAL(10,4), -- +1 SD
  sd2 DECIMAL(10,4), -- +2 SD
  sd3 DECIMAL(10,4), -- +3 SD
  sd4 DECIMAL(10,4), -- +4 SD
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_who_standards_lookup ON public.who_standards(parameter, gender, age_days);
CREATE INDEX idx_who_standards_age ON public.who_standards(age_days);

-- Enable Row Level Security
ALTER TABLE public.who_standards ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read the WHO standards data
CREATE POLICY "WHO standards are publicly readable" 
  ON public.who_standards 
  FOR SELECT 
  USING (true);

-- Only allow authenticated users to insert/update (for data management)
CREATE POLICY "Only authenticated users can modify WHO standards" 
  ON public.who_standards 
  FOR ALL 
  USING (auth.role() = 'authenticated');
