
ALTER TABLE incidents
ADD COLUMN priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM';

CREATE INDEX idx_incidents_priority
ON incidents(priority);
