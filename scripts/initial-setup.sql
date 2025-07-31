-- Drop existing types and tables if they exist (in correct order)
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS grades CASCADE;
DROP TYPE IF EXISTS task_status;
DROP TYPE IF EXISTS task_priority;

-- Create ENUM types for controlled vocabularies
CREATE TYPE task_status AS ENUM ('Pending', 'In Progress', 'Completed', 'Blocked', 'Cancelled');
CREATE TYPE task_priority AS ENUM ('Low', 'Medium', 'High', 'Urgent');

-- Create a function to automatically update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create grades table
CREATE TABLE grades
(
    id          UUID PRIMARY KEY         DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER set_timestamp
    BEFORE UPDATE
    ON grades
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Create teams table
CREATE TABLE teams
(
    id          UUID PRIMARY KEY         DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER set_timestamp
    BEFORE UPDATE
    ON teams
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Create staff table
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
CREATE TRIGGER set_timestamp
    BEFORE UPDATE
    ON staff
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Create tasks table
CREATE TABLE tasks
(
    id                UUID PRIMARY KEY         DEFAULT gen_random_uuid(),
    title             VARCHAR(255)  NOT NULL,
    description       TEXT,
    status            task_status   NOT NULL   DEFAULT 'Pending',
    priority          task_priority NOT NULL   DEFAULT 'Medium',
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
CREATE TRIGGER set_timestamp
    BEFORE UPDATE
    ON tasks
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Create notes table (linked to STAFF as per your types.ts)
CREATE TABLE notes
(
    id         UUID PRIMARY KEY         DEFAULT gen_random_uuid(),
    staff_id   UUID         NOT NULL REFERENCES staff (id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL,
    content    TEXT         NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER set_timestamp
    BEFORE UPDATE
    ON notes
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Create indexes
CREATE INDEX idx_staff_email ON staff (email);
CREATE INDEX idx_staff_staff_number ON staff (staff_number);
CREATE INDEX idx_staff_grade_id ON staff (grade_id);
CREATE INDEX idx_staff_team_id ON staff (team_id);
CREATE INDEX idx_tasks_staff_id ON tasks (staff_id);
CREATE INDEX idx_tasks_due_date ON tasks (due_date);
CREATE INDEX idx_notes_staff_id ON notes (staff_id);