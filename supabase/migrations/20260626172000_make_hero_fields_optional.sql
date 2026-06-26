ALTER TABLE hero_slides ALTER COLUMN title DROP NOT NULL;
ALTER TABLE hero_slides ALTER COLUMN subtitle DROP NOT NULL;
ALTER TABLE hero_slides ALTER COLUMN description DROP NOT NULL;
ALTER TABLE hero_slides ALTER COLUMN cta_text DROP NOT NULL;
NOTIFY pgrst, 'reload schema';
