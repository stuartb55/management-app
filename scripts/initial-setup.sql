-- Drop existing tables if they exist (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS grades CASCADE;

-- Create grades table
CREATE TABLE grades
(
    id          UUID PRIMARY KEY         DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create teams table
CREATE TABLE teams
(
    id          UUID PRIMARY KEY         DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create staff table with foreign key relationships
CREATE TABLE staff
(
    id              UUID PRIMARY KEY         DEFAULT gen_random_uuid(),
    name            VARCHAR(255)        NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    staff_number    VARCHAR(50) UNIQUE  NOT NULL,
    job_role        VARCHAR(255)        NOT NULL,
    job_id          VARCHAR(50),
    grade_id        UUID                REFERENCES grades (id) ON DELETE SET NULL,
    team_id         UUID                REFERENCES teams (id) ON DELETE SET NULL,
    line_manager_id UUID                REFERENCES staff (id) ON DELETE SET NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE tasks
(
    id                UUID PRIMARY KEY         DEFAULT gen_random_uuid(),
    title             VARCHAR(255) NOT NULL,
    description       TEXT,
    status            VARCHAR(50)  NOT NULL    DEFAULT 'Pending',
    priority          VARCHAR(50)  NOT NULL    DEFAULT 'Medium',
    due_date          TIMESTAMP WITH TIME ZONE,
    completed         BOOLEAN                  DEFAULT FALSE,
    completed_at      TIMESTAMP WITH TIME ZONE,
    recurring_pattern JSONB,
    next_due_date     TIMESTAMP WITH TIME ZONE,
    original_task_id  UUID REFERENCES tasks (id) ON DELETE CASCADE,
    staff_id          UUID REFERENCES staff (id) ON DELETE CASCADE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create notes table
CREATE TABLE notes
(
    id         UUID PRIMARY KEY         DEFAULT gen_random_uuid(),
    staff_id   UUID         NOT NULL REFERENCES staff (id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL,
    content    TEXT         NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_staff_email ON staff (email);
CREATE INDEX idx_staff_staff_number ON staff (staff_number);
CREATE INDEX idx_tasks_staff_id ON tasks (staff_id);
CREATE INDEX idx_tasks_due_date ON tasks (due_date);
CREATE INDEX idx_tasks_status ON tasks (status);
CREATE INDEX idx_notes_staff_id ON notes (staff_id);
CREATE INDEX idx_staff_grade_id ON staff (grade_id);
CREATE INDEX idx_staff_team_id ON staff (team_id);
CREATE INDEX idx_staff_line_manager_id ON staff (line_manager_id);
