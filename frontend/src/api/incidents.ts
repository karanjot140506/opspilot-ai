
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
