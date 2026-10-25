
import { useEffect, useState } from "react";
import { getIncidents, type Incident } from "./api/incidents";
import "./App.css";

function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getIncidents()
      .then(setIncidents)
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      })
      .finally(() => setLoading(false));
  }, []);

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
        <h2>Incidents</h2>

        {loading && <p>Loading incidents...</p>}

        {error && <p className="error">{error}</p>}

        {!loading && !error && incidents.length === 0 && (
          <p>No incidents yet. Your dashboard is ready for incident data.</p>
        )}

        <div className="incident-list">
          {incidents.map((incident) => (
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
                <span>Status: {incident.status}</span>
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
