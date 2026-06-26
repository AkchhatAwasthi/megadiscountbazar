ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS mobile_image TEXT;
NOTIFY pgrst, 'reload schema';
