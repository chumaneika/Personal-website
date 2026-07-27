CREATE SEQUENCE base_seq
    START WITH 1
    INCREMENT BY 10;

CREATE TABLE users (
    id BIGINT NOT NULL,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    email VARCHAR(254) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE TABLE profiles (
    id BIGINT NOT NULL,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    headline VARCHAR(160) NOT NULL,
    short_bio TEXT,
    full_bio TEXT,
    location VARCHAR(160),
    email VARCHAR(254),
    telegram_url VARCHAR(512),
    github_url VARCHAR(512),
    linkedin_url VARCHAR(512),
    avatar_url VARCHAR(512),
    resume_url VARCHAR(512),
    CONSTRAINT pk_profiles PRIMARY KEY (id)
);

CREATE TABLE projects (
    id BIGINT NOT NULL,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(180) NOT NULL,
    short_description TEXT,
    full_description TEXT,
    problem_description TEXT,
    solution_description TEXT,
    technology_stack TEXT,
    github_url VARCHAR(512),
    demo_url VARCHAR(512),
    cover_image_url VARCHAR(512),
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    started_at DATE,
    completed_at DATE,
    CONSTRAINT pk_projects PRIMARY KEY (id),
    CONSTRAINT uk_projects_slug UNIQUE (slug)
);

CREATE TABLE articles (
    id BIGINT NOT NULL,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(180) NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    cover_image_url VARCHAR(512),
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    CONSTRAINT pk_articles PRIMARY KEY (id),
    CONSTRAINT uk_articles_slug UNIQUE (slug)
);

CREATE TABLE skill_category (
    id BIGINT NOT NULL,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    name VARCHAR(120) NOT NULL,
    CONSTRAINT pk_skill_category PRIMARY KEY (id),
    CONSTRAINT uk_skill_category_name UNIQUE (name)
);

CREATE TABLE skills (
    id BIGINT NOT NULL,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    name VARCHAR(120) NOT NULL,
    category_id BIGINT NOT NULL,
    level VARCHAR(32) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_skills PRIMARY KEY (id),
    CONSTRAINT fk_skills_category FOREIGN KEY (category_id) REFERENCES skill_category (id)
);

CREATE TABLE contact_messages (
    id BIGINT NOT NULL,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    sender_name VARCHAR(120) NOT NULL,
    sender_email VARCHAR(254) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'NEW',
    CONSTRAINT pk_contact_messages PRIMARY KEY (id)
);
