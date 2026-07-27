ALTER TABLE users
    ADD CONSTRAINT ck_users_role CHECK (role IN ('ADMIN'));

ALTER TABLE projects
    ADD CONSTRAINT ck_projects_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'));

ALTER TABLE projects
    ADD CONSTRAINT ck_projects_dates CHECK (
        completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at
    );

ALTER TABLE articles
    ADD CONSTRAINT ck_articles_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'));

ALTER TABLE skills
    ADD CONSTRAINT ck_skills_level CHECK (level IN ('BASIC', 'INTERMEDIATE', 'ADVANCED'));

ALTER TABLE skills
    ADD CONSTRAINT ck_skills_sort_order CHECK (sort_order >= 0);

ALTER TABLE contact_messages
    ADD CONSTRAINT ck_contact_messages_status CHECK (status IN ('NEW', 'READ', 'ARCHIVED'));

CREATE INDEX idx_projects_status_created_at ON projects (status, created_at DESC);
CREATE INDEX idx_articles_status_created_at ON articles (status, created_at DESC);
CREATE INDEX idx_skills_visible_sort_order ON skills (visible, sort_order, name);
CREATE INDEX idx_skills_category ON skills (category_id);
CREATE INDEX idx_contact_messages_status_created_at ON contact_messages (status, created_at DESC);
