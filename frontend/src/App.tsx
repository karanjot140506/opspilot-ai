import { useEffect, useState } from "react";
import {
  getIncidents,
  createIncident,
  updateIncidentStatus,
  type Incident,
  type CreateIncidentRequest,
} from "./api/incidents";
import "./App.css";

const emptyForm: CreateIncidentRequest = {
  title: "",
  description: "",
  severity: "MEDIUM",
  serviceName: "",
};

function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [form, setForm] = useState<CreateIncidentRequest>(emptyForm);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const filteredIncidents = incidents.filter((incident) => {
    const query = search.toLowerCase().trim();

    const matchesSearch =
      incident.title.toLowerCase().includes(query) ||
      incident.description.toLowerCase().includes(query);

    const matchesSeverity =
      severityFilter === "ALL" || incident.severity === severityFilter;

    const matchesStatus =
      statusFilter === "ALL" || incident.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

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
        </div>

        <p className="filter-count">
          Showing {filteredIncidents.length} of {incidents.length} incidents
        </p>

        {loading && <p>Loading incidents...</p>}

        {!loading && !error && incidents.length === 0 && (
          <p>No incidents yet. Create your first incident above.</p>
        )}

        <div className="incident-list">
          {filteredIncidents.map((incident) => (
            <article className="incident-card" key={incident.id}>
              <div className="incident-card-heading">
                <h3>{incident.title}</h3>
                <span className={`severity ${incident.severity.toLowerCase()}`}>
                  {incident.severity}
                </span>
              </div>

              <p>{incident.description}</p>

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
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
