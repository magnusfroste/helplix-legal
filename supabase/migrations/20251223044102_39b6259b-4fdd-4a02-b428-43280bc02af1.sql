-- Add interpretation_report column to reports table
ALTER TABLE public.reports 
ADD COLUMN interpretation_report TEXT;