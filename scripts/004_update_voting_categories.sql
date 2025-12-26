-- Add category_5 column to votes table
ALTER TABLE public.votes 
ADD COLUMN IF NOT EXISTS category_5 DECIMAL(3,1) NOT NULL DEFAULT 0;

-- Update constraints to allow 0-10 range with 0.5 increments for all categories
ALTER TABLE public.votes DROP CONSTRAINT IF EXISTS votes_category_1_check;
ALTER TABLE public.votes DROP CONSTRAINT IF EXISTS votes_category_2_check;
ALTER TABLE public.votes DROP CONSTRAINT IF EXISTS votes_category_3_check;
ALTER TABLE public.votes DROP CONSTRAINT IF EXISTS votes_category_4_check;

-- Change column types to DECIMAL to support half points
ALTER TABLE public.votes ALTER COLUMN category_1 TYPE DECIMAL(3,1);
ALTER TABLE public.votes ALTER COLUMN category_2 TYPE DECIMAL(3,1);
ALTER TABLE public.votes ALTER COLUMN category_3 TYPE DECIMAL(3,1);
ALTER TABLE public.votes ALTER COLUMN category_4 TYPE DECIMAL(3,1);

-- Add new constraints for 0-10 range
ALTER TABLE public.votes ADD CONSTRAINT votes_category_1_check CHECK (category_1 >= 0 AND category_1 <= 10);
ALTER TABLE public.votes ADD CONSTRAINT votes_category_2_check CHECK (category_2 >= 0 AND category_2 <= 10);
ALTER TABLE public.votes ADD CONSTRAINT votes_category_3_check CHECK (category_3 >= 0 AND category_3 <= 10);
ALTER TABLE public.votes ADD CONSTRAINT votes_category_4_check CHECK (category_4 >= 0 AND category_4 <= 10);
ALTER TABLE public.votes ADD CONSTRAINT votes_category_5_check CHECK (category_5 >= 0 AND category_5 <= 10);
