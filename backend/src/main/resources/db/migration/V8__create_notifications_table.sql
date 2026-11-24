
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,

    incident_id BIGINT REFERENCES incidents(id) ON DELETE CASCADE,

    recipient_team_member_id BIGINT
        REFERENCES team_members(id) ON DELETE CASCADE,

    type VARCHAR(50) NOT NULL,

    title VARCHAR(200) NOT NULL,

    message TEXT NOT NULL,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_recipient
ON notifications(recipient_team_member_id);

CREATE INDEX idx_notifications_is_read
ON notifications(is_read);

CREATE INDEX idx_notifications_created_at
ON notifications(created_at DESC);

CREATE INDEX idx_notifications_incident
ON notifications(incident_id);