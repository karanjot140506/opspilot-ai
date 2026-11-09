ALTER TABLE incidents
ADD COLUMN response_due_at TIMESTAMPTZ,
ADD COLUMN resolution_due_at TIMESTAMPTZ,
ADD COLUMN first_response_at TIMESTAMPTZ,
ADD COLUMN resolved_at TIMESTAMPTZ;

CREATE INDEX idx_incidents_response_due_at
ON incidents(response_due_at);

CREATE INDEX idx_incidents_resolution_due_at
ON incidents(resolution_due_at);