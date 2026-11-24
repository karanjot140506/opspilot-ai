export interface Incident {
  id: number;
  title: string;
  description: string;
  severity: string;
  status: string;
  priority: string;
  serviceName: string;
  createdAt: string;
  updatedAt: string;
  assignedToId: number | null;
  slaStatus: string;
  escalationLevel: number;
  responseDueAt: string | null;
  resolutionDueAt: string | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
}

export interface CreateIncidentRequest {
  title: string;
  description: string;
  severity: string;
  serviceName: string;
  priority: string;
}

const API_BASE_URL = "http://localhost:8080/api/incidents";

export async function getIncidents(): Promise<Incident[]> {
  const response = await fetch(API_BASE_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch incidents: ${response.status}`);
  }

  return response.json() as Promise<Incident[]>;
}

export async function createIncident(
  incident: CreateIncidentRequest,
): Promise<Incident> {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(incident),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Failed to create incident: ${response.status}`);
  }

  return response.json() as Promise<Incident>;
}

export async function updateIncidentStatus(
  id: number,
  status: string,
): Promise<Incident> {
  const response = await fetch(`${API_BASE_URL}/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Failed to update incident status: ${response.status}`,
    );
  }

  return response.json() as Promise<Incident>;
}

export interface IncidentActivity {
  id: number;
  incidentId: number;
  action: string;
  description: string;
  oldValue: string | null;
  newValue: string | null;
  assignedToId: number | null;
  createdAt: string;
}

export async function getIncidentActivities(
  incidentId: number,
): Promise<IncidentActivity[]> {
  const response = await fetch(
    `http://localhost:8080/api/incidents/${incidentId}/activities`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch incident activities");
  }

  return response.json();
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}
export async function getTeamMembers(): Promise<TeamMember[]> {
  const response = await fetch("http://localhost:8080/api/team-members");

  if (!response.ok) {
    throw new Error("Failed to fetch team members");
  }

  return response.json();
}
export async function assignIncident(
  incidentId: number,
  teamMemberId: number,
): Promise<Incident> {
  const response = await fetch(
    `http://localhost:8080/api/incidents/${incidentId}/assign`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ teamMemberId }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to assign incident");
  }

  return response.json();
}

export interface AssigneeRecommendation {
  recommendation: string;
}

export async function recommendIncidentAssignee(
  incident: Incident,
): Promise<string> {
  const response = await fetch(
    "http://localhost:8080/api/ai/recommend-assignee",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        serviceName: incident.serviceName,
      }),
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to get AI recommendation");
  }

  return response.text();
}

export interface Notification {
  id: number;
  incidentId: number | null;
  incidentTitle: string | null;
  recipientTeamMemberId: number | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const NOTIFICATIONS_API_URL = "http://localhost:8080/api/notifications";

export async function getNotifications(
  recipientId: number,
): Promise<Notification[]> {
  const response = await fetch(
    `${NOTIFICATIONS_API_URL}?recipientId=${recipientId}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return response.json();
}

export async function getUnreadNotificationCount(
  recipientId: number,
): Promise<number> {
  const response = await fetch(
    `${NOTIFICATIONS_API_URL}/unread/count?recipientId=${recipientId}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch unread notification count");
  }

  return response.json();
}

export async function markNotificationAsRead(
  notificationId: number,
): Promise<void> {
  const response = await fetch(
    `${NOTIFICATIONS_API_URL}/${notificationId}/read`,
    {
      method: "PATCH",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to mark notification as read");
  }
}

export async function markAllNotificationsAsRead(
  recipientId: number,
): Promise<void> {
  const response = await fetch(
    `${NOTIFICATIONS_API_URL}/read-all?recipientId=${recipientId}`,
    {
      method: "PATCH",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to mark all notifications as read");
  }
}
