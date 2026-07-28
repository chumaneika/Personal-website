ALTER TABLE profiles
    ADD COLUMN avatar_avif_url VARCHAR(512);
ALTER TABLE profiles
    ADD COLUMN avatar_webp_url VARCHAR(512);

ALTER TABLE projects
    ADD COLUMN cover_image_avif_url VARCHAR(512);
ALTER TABLE projects
    ADD COLUMN cover_image_webp_url VARCHAR(512);

ALTER TABLE articles
    ADD COLUMN cover_image_avif_url VARCHAR(512);
ALTER TABLE articles
    ADD COLUMN cover_image_webp_url VARCHAR(512);
