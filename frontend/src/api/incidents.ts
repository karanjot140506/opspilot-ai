
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
  incident: CreateIncidentRequest
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
  status: string
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
      message || `Failed to update incident status: ${response.status}`
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
  incidentId: number
): Promise<IncidentActivity[]> {
  const response = await fetch(
    `http://localhost:8080/api/incidents/${incidentId}/activities`
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
  teamMemberId: number
): Promise<Incident> {
  const response = await fetch(
    `http://localhost:8080/api/incidents/${incidentId}/assign`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ teamMemberId }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to assign incident");
  }

  return response.json();
}