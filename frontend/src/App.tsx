import { useEffect, useMemo, useState } from "react";
import {
  getIncidents,
  createIncident,
  updateIncidentStatus,
  getIncidentActivities,
  getTeamMembers,
  assignIncident,
  recommendIncidentAssignee,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Incident,
  type TeamMember,
  type CreateIncidentRequest,
  type IncidentActivity,
  type Notification,
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [dashboardSeverityFilter, setDashboardSeverityFilter] = useState("ALL");

  const [dashboardStatusFilter, setDashboardStatusFilter] = useState("ALL");

  const [dashboardAssigneeFilter, setDashboardAssigneeFilter] = useState("ALL");
  const workloadData = useMemo(() => {
    return teamMembers.map((member) => {
      const assignedIncidents = incidents.filter(
        (incident) => incident.assignedToId === member.id,
      );

      return {
        id: member.id,
        name: member.name,
        total: assignedIncidents.length,
        inProgress: assignedIncidents.filter(
          (incident) => incident.status === "IN_PROGRESS",
        ).length,
      };
    });
  }, [teamMembers, incidents]);

  const unassignedIncidents = incidents.filter(
    (incident) => incident.assignedToId == null,
  );
  const filteredDashboardIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSeverity =
        dashboardSeverityFilter === "ALL" ||
        incident.severity === dashboardSeverityFilter;

      const matchesStatus =
        dashboardStatusFilter === "ALL" ||
        incident.status === dashboardStatusFilter;

      const matchesAssignee =
        dashboardAssigneeFilter === "ALL" ||
        (dashboardAssigneeFilter === "UNASSIGNED"
          ? incident.assignedToId == null
          : incident.assignedToId === Number(dashboardAssigneeFilter));

      return matchesSeverity && matchesStatus && matchesAssignee;
    });
  }, [
    incidents,
    dashboardSeverityFilter,
    dashboardStatusFilter,
    dashboardAssigneeFilter,
  ]);

  const dashboardStats = useMemo(() => {
    return {
      total: filteredDashboardIncidents.length,

      open: filteredDashboardIncidents.filter(
        (incident) => incident.status === "OPEN",
      ).length,

      inProgress: filteredDashboardIncidents.filter(
        (incident) => incident.status === "IN_PROGRESS",
      ).length,

      resolved: filteredDashboardIncidents.filter(
        (incident) => incident.status === "RESOLVED",
      ).length,

      breached: filteredDashboardIncidents.filter(
        (incident) => incident.slaStatus === "BREACHED",
      ).length,

      atRisk: filteredDashboardIncidents.filter(
        (incident) => incident.slaStatus === "AT_RISK",
      ).length,

      onTrack: filteredDashboardIncidents.filter(
        (incident) => incident.slaStatus === "ON_TRACK",
      ).length,

      completed: filteredDashboardIncidents.filter(
        (incident) => incident.slaStatus === "COMPLETED",
      ).length,

      averageResolutionMinutes: (() => {
        const resolvedIncidents = filteredDashboardIncidents.filter(
          (incident) =>
            incident.status === "RESOLVED" &&
            incident.createdAt &&
            incident.resolvedAt,
        );

        if (resolvedIncidents.length === 0) {
          return 0;
        }

        const totalMinutes = resolvedIncidents.reduce((total, incident) => {
          const created = new Date(incident.createdAt).getTime();
          const resolved = new Date(incident.resolvedAt!).getTime();

          return total + (resolved - created) / 60000;
        }, 0);

        return Math.round(totalMinutes / resolvedIncidents.length);
      })(),

      critical: filteredDashboardIncidents.filter(
        (incident) => incident.severity === "CRITICAL",
      ).length,

      high: filteredDashboardIncidents.filter(
        (incident) => incident.severity === "HIGH",
      ).length,

      medium: filteredDashboardIncidents.filter(
        (incident) => incident.severity === "MEDIUM",
      ).length,

      low: filteredDashboardIncidents.filter(
        (incident) => incident.severity === "LOW",
      ).length,

      criticalPriority: filteredDashboardIncidents.filter(
        (incident) => incident.priority === "CRITICAL",
      ).length,

      highPriority: filteredDashboardIncidents.filter(
        (incident) => incident.priority === "HIGH",
      ).length,

      mediumPriority: filteredDashboardIncidents.filter(
        (incident) => incident.priority === "MEDIUM",
      ).length,

      lowPriority: filteredDashboardIncidents.filter(
        (incident) => incident.priority === "LOW",
      ).length,
    };
  }, [filteredDashboardIncidents]);
  const severityData = [
    { label: "Critical", value: dashboardStats.critical },
    { label: "High", value: dashboardStats.high },
    { label: "Medium", value: dashboardStats.medium },
    { label: "Low", value: dashboardStats.low },
  ];

  const maxSeverityCount = Math.max(
    ...severityData.map((item) => item.value),
    1,
  );

  const incidentTrendData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      return {
        key,
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        count: 0,
      };
    });

    filteredDashboardIncidents.forEach((incident) => {
      const date = new Date(incident.createdAt);

      if (Number.isNaN(date.getTime())) return;

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      const day = days.find((item) => item.key === key);

      if (day) day.count++;
    });

    return days;
  }, [filteredDashboardIncidents]);
  const [recommendation, setRecommendation] = useState("");
  const [recommendationIncidentId, setRecommendationIncidentId] = useState<
    number | null
  >(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);

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
  const NOTIFICATION_RECIPIENT_ID = 1;

  const loadNotifications = async () => {
    setNotificationLoading(true);
    setNotificationError("");

    try {
      const [notificationData, unreadCount] = await Promise.all([
        getNotifications(NOTIFICATION_RECIPIENT_ID),
        getUnreadNotificationCount(NOTIFICATION_RECIPIENT_ID),
      ]);

      setNotifications(notificationData);
      setUnreadNotificationCount(unreadCount);
    } catch (err) {
      setNotificationError("Unable to load notifications.");
      console.error(err);
    } finally {
      setNotificationLoading(false);
    }
  };
  const handleMarkNotificationAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId);
      await loadNotifications();
    } catch (err) {
      setNotificationError("Unable to update notification.");
      console.error(err);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await markAllNotificationsAsRead(NOTIFICATION_RECIPIENT_ID);
      await loadNotifications();
    } catch (err) {
      setNotificationError("Unable to update notifications.");
      console.error(err);
    }
  };
  useEffect(() => {
    void loadIncidents();
  }, []);
  useEffect(() => {
    loadNotifications();

    const notificationInterval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(notificationInterval);
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

  async function handleRecommendAssignee(incident: Incident) {
    setRecommendationLoading(true);
    setRecommendation("");
    setRecommendationIncidentId(incident.id);
    setError("");

    try {
      const result = await recommendIncidentAssignee(incident);
      setRecommendation(result);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to get AI recommendation",
      );
      setRecommendationIncidentId(null);
    } finally {
      setRecommendationLoading(false);
    }
  }

  async function handleAcceptRecommendation(incidentId: number) {
    const match = recommendation.match(/Recommended team member ID:\s*(\d+)/i);

    if (!match) {
      setError(
        "Could not identify a valid team member ID in the AI recommendation.",
      );
      return;
    }

    const teamMemberId = Number(match[1]);

    const memberExists = teamMembers.some(
      (member) => member.id === teamMemberId,
    );

    if (!memberExists) {
      setError("The recommended team member does not exist.");
      return;
    }

    await handleAssignIncident(incidentId, teamMemberId);
    setSuccess("AI-recommended team member assigned successfully.");
  }

  const handleExportDashboard = () => {
    const headers = [
      "ID",
      "Title",
      "Severity",
      "Priority",
      "Status",
      "Service",
      "Assigned To",
      "SLA Status",
      "Created At",
    ];

    const rows = filteredDashboardIncidents.map((incident) => {
      const assignedMember = teamMembers.find(
        (member) => member.id === incident.assignedToId,
      );

      return [
        incident.id,
        incident.title,
        incident.severity,
        incident.priority,
        incident.status,
        incident.serviceName,
        assignedMember?.name || "Unassigned",
        incident.slaStatus,
        incident.createdAt,
      ];
    });

    const escapeCsv = (value: unknown) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const csvContent = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "opspilot-dashboard-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

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

        <div className="header-actions">
          <button
            className="notification-bell"
            onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
            aria-label="Toggle notifications"
          >
            🔔
            {unreadNotificationCount > 0 && (
              <span className="notification-badge">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          <div className="incident-count">
            <span>Total incidents</span>
            <strong>{incidents.length}</strong>
          </div>
        </div>
      </header>

      <section className="dashboard-filters">
        <h3>Filter Dashboard</h3>

        <div className="filter-controls">
          <select
            value={dashboardSeverityFilter}
            onChange={(e) => setDashboardSeverityFilter(e.target.value)}
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={dashboardStatusFilter}
            onChange={(e) => setDashboardStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={dashboardAssigneeFilter}
            onChange={(e) => setDashboardAssigneeFilter(e.target.value)}
          >
            <option value="ALL">All Team Members</option>
            <option value="UNASSIGNED">Unassigned</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={String(member.id)}>
                {member.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setDashboardSeverityFilter("ALL");
              setDashboardStatusFilter("ALL");
              setDashboardAssigneeFilter("ALL");
            }}
          >
            Reset Filters
          </button>

          <button type="button" onClick={handleExportDashboard}>
            Export Dashboard CSV
          </button>
        </div>
      </section>

      <section className="analytics-section">
        <h2>Incident Analytics</h2>

        <div className="dashboard-grid">
          <div className="stat-card">
            <h3>Total Incidents</h3>
            <p>{dashboardStats.total}</p>
          </div>

          <div className="stat-card">
            <h3>Open Incidents</h3>
            <p>{dashboardStats.open}</p>
          </div>

          <div className="stat-card">
            <h3>In Progress</h3>
            <p>{dashboardStats.inProgress}</p>
          </div>

          <div className="stat-card">
            <h3>Resolved</h3>
            <p>{dashboardStats.resolved}</p>
          </div>

          <div className="stat-card">
            <h3>SLA Breached</h3>
            <p>{dashboardStats.breached}</p>
          </div>
          <div className="stat-card">
            <h3>Avg. Resolution Time</h3>
            <p>{dashboardStats.averageResolutionMinutes} min</p>
          </div>
        </div>
        <div className="sla-overview-section">
          <h3>SLA Health Overview</h3>

          <div className="sla-grid">
            <div className="sla-card on-track">
              <span>On Track</span>
              <strong>{dashboardStats.onTrack}</strong>
            </div>

            <div className="sla-card at-risk">
              <span>At Risk</span>
              <strong>{dashboardStats.atRisk}</strong>
            </div>

            <div className="sla-card breached">
              <span>Breached</span>
              <strong>{dashboardStats.breached}</strong>
            </div>

            <div className="sla-card completed">
              <span>Completed</span>
              <strong>{dashboardStats.completed}</strong>
            </div>
          </div>
        </div>
        <div className="severity-section">
          <h3>Incidents by Severity</h3>
          <div className="severity-chart">
            {severityData.map((item) => (
              <div className="chart-row" key={item.label}>
                <span className="chart-label">{item.label}</span>

                <div className="chart-track">
                  <div
                    className={`chart-bar ${item.label.toLowerCase()}`}
                    style={{
                      width: `${(item.value / maxSeverityCount) * 100}%`,
                    }}
                  />
                </div>

                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
          <div className="severity-grid">
            <div className="severity-card critical">
              <span>Critical</span>
              <strong>{dashboardStats.critical}</strong>
            </div>

            <div className="severity-card high">
              <span>High</span>
              <strong>{dashboardStats.high}</strong>
            </div>

            <div className="severity-card medium">
              <span>Medium</span>
              <strong>{dashboardStats.medium}</strong>
            </div>

            <div className="severity-card low">
              <span>Low</span>
              <strong>{dashboardStats.low}</strong>
            </div>
          </div>
        </div>
        <div className="priority-section">
          <h3>Incidents by Priority</h3>

          <div className="priority-grid">
            <div className="priority-card critical">
              <span>Critical</span>
              <strong>{dashboardStats.criticalPriority}</strong>
            </div>

            <div className="priority-card high">
              <span>High</span>
              <strong>{dashboardStats.highPriority}</strong>
            </div>

            <div className="priority-card medium">
              <span>Medium</span>
              <strong>{dashboardStats.mediumPriority}</strong>
            </div>

            <div className="priority-card low">
              <span>Low</span>
              <strong>{dashboardStats.lowPriority}</strong>
            </div>
          </div>
        </div>
        <div className="workload-section">
          <h3>Team Workload Analytics</h3>

          <div className="workload-summary">
            <div className="workload-card">
              <span>Unassigned Incidents</span>
              <strong>{unassignedIncidents.length}</strong>
            </div>

            <div className="workload-card">
              <span>Team Members</span>
              <strong>{teamMembers.length}</strong>
            </div>
          </div>

          <div className="workload-list">
            {workloadData.map((member) => (
              <div className="workload-item" key={member.id}>
                <div className="workload-info">
                  <strong>{member.name}</strong>
                  <span>
                    {member.total} assigned · {member.inProgress} in progress
                  </span>
                </div>

                <div className="workload-track">
                  <div
                    className="workload-bar"
                    style={{
                      width: `${
                        (member.total /
                          Math.max(
                            ...workloadData.map((item) => item.total),
                            1,
                          )) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="trend-section">
          <h3>Incident Trends (Last 7 Days)</h3>

          <div className="trend-chart">
            {incidentTrendData.map((day) => (
              <div className="trend-column" key={day.key}>
                <strong>{day.count}</strong>

                <div className="trend-bar-container">
                  <div
                    className="trend-bar"
                    style={{
                      height: `${
                        (day.count /
                          Math.max(
                            ...incidentTrendData.map((item) => item.count),
                            1,
                          )) *
                        100
                      }%`,
                    }}
                  />
                </div>

                <span>{day.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
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

              <div className="escalation-section">
                <strong>Escalation Level:</strong>
                <span
                  className={`escalation-badge level-${incident.escalationLevel}`}
                >
                  Level {incident.escalationLevel}
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
                onClick={() => void handleRecommendAssignee(incident)}
                disabled={recommendationLoading}
              >
                {recommendationLoading &&
                recommendationIncidentId === incident.id
                  ? "Analyzing..."
                  : "Recommend Assignee (AI)"}
              </button>

              {recommendationIncidentId === incident.id && (
                <div className="ai-recommendation">
                  <h4>AI Assignment Recommendation</h4>

                  {recommendationLoading ? (
                    <p>AI is analyzing the incident and team skills...</p>
                  ) : (
                    <p className="recommendation-text">{recommendation}</p>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() => void handleAcceptRecommendation(incident.id)}
              >
                Accept Recommendation
              </button>

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
      {notificationPanelOpen && (
        <section className="notification-panel">
          <div className="notification-panel-header">
            <h2>Notifications</h2>

            {unreadNotificationCount > 0 && (
              <button
                onClick={handleMarkAllNotificationsAsRead}
                className="mark-all-read-button"
              >
                Mark all as read
              </button>
            )}
          </div>

          {notificationError && (
            <p className="notification-error">{notificationError}</p>
          )}

          {notificationLoading && <p>Loading notifications...</p>}

          {!notificationLoading && notifications.length === 0 && (
            <p className="empty-notifications">No notifications yet.</p>
          )}

          {!notificationLoading &&
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${
                  notification.read ? "read" : "unread"
                }`}
              >
                <div>
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                  <small>
                    {new Date(notification.createdAt).toLocaleString()}
                  </small>
                </div>

                {!notification.read && (
                  <button
                    onClick={() =>
                      handleMarkNotificationAsRead(notification.id)
                    }
                    className="mark-read-button"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
        </section>
      )}
    </main>
  );
}

export default App;
