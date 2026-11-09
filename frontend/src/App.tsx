import { useEffect, useState } from "react";
import {
  getIncidents,
  createIncident,
  updateIncidentStatus,
  getIncidentActivities,
  getTeamMembers,
  assignIncident,
  type Incident,
  type TeamMember,
  type CreateIncidentRequest,
  type IncidentActivity,
} from "./api/incidents";
import "./App.css";

const emptyForm: CreateIncidentRequest = {
  title: "",
  description: "",
  severity: "MEDIUM",
  serviceName: "",
  priority: "MEDIUM",
};

function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activities, setActivities] = useState<IncidentActivity[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(
    null,
  );
  const [activityLoading, setActivityLoading] = useState(false);
  const [form, setForm] = useState<CreateIncidentRequest>(emptyForm);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  async function loadIncidents() {
    setError("");
    try {
      const data = await getIncidents();
      setIncidents(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load incidents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadIncidents();
  }, []);

  useEffect(() => {
    async function loadTeamMembers() {
      try {
        const data = await getTeamMembers();
        setTeamMembers(data);
      } catch (error) {
        console.error("Failed to load team members:", error);
      }
    }

    loadTeamMembers();
  }, []);

  const filteredIncidents = incidents.filter((incident) => {
    const query = search.toLowerCase().trim();

    const matchesSearch =
      incident.title.toLowerCase().includes(query) ||
      incident.description.toLowerCase().includes(query);

    const matchesSeverity =
      severityFilter === "ALL" || incident.severity === severityFilter;

    const matchesStatus =
      statusFilter === "ALL" || incident.status === statusFilter;

    const matchesPriority =
      priorityFilter === "ALL" || incident.priority === priorityFilter;

    return matchesSearch && matchesSeverity && matchesStatus && matchesPriority;
  });

  const priorityOrder: Record<string, number> = {
    CRITICAL: 1,
    HIGH: 2,
    MEDIUM: 3,
    LOW: 4,
  };

  const sortedIncidents = [...filteredIncidents].sort(
    (a, b) =>
      (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99),
  );

  function updateForm(field: keyof CreateIncidentRequest, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await createIncident(form);
      setForm(emptyForm);
      setSuccess("Incident created successfully.");
      await loadIncidents();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to create incident",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(incidentId: number, newStatus: string) {
    setError("");
    setSuccess("");

    try {
      await updateIncidentStatus(incidentId, newStatus);
      setSuccess("Incident status updated successfully.");
      await loadIncidents();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to update incident status",
      );
    }
  }
  async function handleViewActivity(incidentId: number) {
    if (selectedIncidentId === incidentId) {
      setSelectedIncidentId(null);
      setActivities([]);
      return;
    }

    setSelectedIncidentId(incidentId);
    setActivities([]);
    setActivityLoading(true);
    setError("");

    try {
      const data = await getIncidentActivities(incidentId);
      setActivities(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load incident activities",
      );
    } finally {
      setActivityLoading(false);
    }
  }

  async function handleAssignIncident(
    incidentId: number,
    teamMemberId: number,
  ) {
    try {
      await assignIncident(incidentId, teamMemberId);

      const updatedIncidents = await getIncidents();
      setIncidents(updatedIncidents);

      if (selectedIncidentId === incidentId) {
        const updatedActivities = await getIncidentActivities(incidentId);
        setActivities(updatedActivities);
      }
    } catch (error) {
      console.error("Failed to assign incident:", error);
      alert("Failed to assign incident. Please try again.");
    }
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">IT OPERATIONS INTELLIGENCE</p>
          <h1>OpsPilot AI</h1>
          <p className="subtitle">
            Incident intelligence and resolution dashboard
          </p>
        </div>

        <div className="incident-count">
          <span>Total incidents</span>
          <strong>{incidents.length}</strong>
        </div>
      </header>

      <section className="incident-section">
        <h2>Create Incident</h2>

        <form className="incident-form" onSubmit={handleSubmit}>
          <label>
            Incident title
            <input
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
              maxLength={200}
              placeholder="e.g. Payment service returning HTTP 500"
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(event) =>
                updateForm("description", event.target.value)
              }
              placeholder="Describe the issue and its impact"
              rows={4}
              required
            />
          </label>

          <div className="form-row">
            <label>
              Severity
              <select
                value={form.severity}
                onChange={(event) => updateForm("severity", event.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </label>

            <label>
              Priority
              <select
                value={form.priority}
                onChange={(event) => updateForm("priority", event.target.value)}
                required
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </label>

            <label>
              Affected service
              <input
                value={form.serviceName}
                onChange={(event) =>
                  updateForm("serviceName", event.target.value)
                }
                maxLength={100}
                placeholder="e.g. payment-service"
                required
              />
            </label>
          </div>

          <button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Incident"}
          </button>
        </form>

        {success && <p className="success">{success}</p>}
        {error && <p className="error">{error}</p>}
      </section>

      <section className="incident-section">
        <h2>Incidents</h2>
        <div className="incident-filters">
          <input
            type="search"
            placeholder="Search title or description..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={severityFilter}
            onChange={(event) => setSeverityFilter(event.target.value)}
          >
            <option value="ALL">All severities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <p className="filter-count">
          Showing {filteredIncidents.length} of {incidents.length} incidents
        </p>

        {loading && <p>Loading incidents...</p>}

        {!loading && !error && incidents.length === 0 && (
          <p>No incidents yet. Create your first incident above.</p>
        )}

        <div className="incident-list">
          {sortedIncidents.map((incident) => (
            <article className="incident-card" key={incident.id}>
              <div className="incident-card-heading">
                <h3>{incident.title}</h3>

                <div className="incident-badges">
                  <span
                    className={`severity ${incident.severity.toLowerCase()}`}
                  >
                    {incident.severity}
                  </span>

                  <span
                    className={`priority ${incident.priority.toLowerCase()}`}
                  >
                    {incident.priority}
                  </span>
                </div>
              </div>

              <p>{incident.description}</p>

              <div className="sla-section">
                <strong>SLA Status:</strong>
                <span
                  className={`sla-badge ${incident.slaStatus?.toLowerCase()}`}
                >
                  {incident.slaStatus?.replace(/_/g, " ") ?? "UNKNOWN"}
                </span>
              </div>

              <div className="incident-meta">
                <span>Service: {incident.serviceName}</span>

                <label className="status-control">
                  Status:
                  <select
                    value={incident.status}
                    onChange={(event) =>
                      void handleStatusChange(incident.id, event.target.value)
                    }
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </label>

                <span>
                  Created: {new Date(incident.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="assignment-section">
                <label htmlFor={`assignee-${incident.id}`}>Assigned To</label>

                <select
                  id={`assignee-${incident.id}`}
                  value={incident.assignedToId ?? ""}
                  onChange={(e) =>
                    handleAssignIncident(incident.id, Number(e.target.value))
                  }
                >
                  <option value="">Unassigned</option>

                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => void handleViewActivity(incident.id)}
              >
                {selectedIncidentId === incident.id
                  ? "Hide Activity"
                  : "View Activity"}
              </button>

              {selectedIncidentId === incident.id && (
                <div className="activity-timeline">
                  <h4>Activity Timeline</h4>

                  {activityLoading ? (
                    <p>Loading activity...</p>
                  ) : activities.length === 0 ? (
                    <p>No activity recorded yet.</p>
                  ) : (
                    <ol>
                      {activities.map((activity) => (
                        <li key={activity.id}>
                          <strong>{activity.action.replace(/_/g, " ")}</strong>
                          <p>{activity.description}</p>
                          <small>
                            {new Date(activity.createdAt).toLocaleString()}
                          </small>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
