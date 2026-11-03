
-- Create table for WHO growth standards data
CREATE TABLE public.who_standards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parameter TEXT NOT NULL, -- 'weight', 'height', 'head_circumference', 'arm_circumference', 'bmi'
  gender TEXT NOT NULL, -- 'male' or 'female'
  age_days INTEGER NOT NULL, -- age in days (0 to ~1825 for 5 years)
  mean_value DECIMAL(10,4) NOT NULL, -- the expected/mean value
  sd_value DECIMAL(10,4), -- standard deviation if available
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_who_standards_lookup ON public.who_standards(parameter, gender, age_days);
CREATE INDEX idx_who_standards_age ON public.who_standards(age_days);

-- Since this is reference data that doesn't need user-specific access, we'll make it publicly readable
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
