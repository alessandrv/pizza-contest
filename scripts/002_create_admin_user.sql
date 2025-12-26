-- This script helps you make an existing user an admin
-- Replace 'your-email@example.com' with the email address you want to make admin

UPDATE public.profiles
SET is_admin = true
WHERE email = 'your-email@example.com';

-- Verify the update
SELECT id, email, is_admin FROM public.profiles WHERE email = 'your-email@example.com';
