-- Make alessandropiccin00@gmail.com an admin user

UPDATE public.profiles
SET is_admin = true
WHERE email = 'alessandropiccin00@gmail.com';

-- Verify the update
SELECT id, email, is_admin FROM public.profiles WHERE email = 'alessandropiccin00@gmail.com';
