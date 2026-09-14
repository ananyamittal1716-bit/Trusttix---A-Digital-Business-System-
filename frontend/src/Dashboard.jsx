import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import logo from "./assets/Logo.jpeg";

const filters = ["all", "pending", "clean", "flagged", "cancelled"];

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [riskScores, setRiskScores] = useState({});
  const [anomalyScores, setAnomalyScores] = useState({});
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");

  const loadData = async (isRefresh = false) => {
    setError("");
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [{ data: bookingsData, error: bookingsError }, { data: riskData, error: riskError }, { data: anomalyData, error: anomalyError }] =
        await Promise.all([
        supabase.from("bookings").select("*"),
        supabase.from("risk_scores").select("*"),
        supabase.from("anomaly_scores").select("*"),
      ]);

      if (bookingsError || riskError || anomalyError) {
        setError("We couldn't load the latest review data. Please try again.");
      } else {
        setBookings(bookingsData || []);
        setRiskScores(Object.fromEntries((riskData || []).map((score) => [score.booking_id, score])));
        setAnomalyScores(Object.fromEntries((anomalyData || []).map((score) => [score.booking_id, score])));
      }
    } catch {
      setError("We couldn't load the latest review data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/";
        return;
      }
      setAuthorized(true);
      loadData();
    };
    initialize();
  }, []);

  const handleLogout = async () => {
    const { error: logoutError } = await supabase.auth.signOut();
    if (logoutError) {
      setError("We couldn't sign you out. Please try again.");
      return;
    }
    window.location.href = "/";
  };

  const act = async (bookingId, decision) => {
    setActionId(`${bookingId}-${decision}`);
    const { error: updateError } = await supabase.from("bookings").update({ status: decision }).eq("booking_id", bookingId);
    const { data: userData } = await supabase.auth.getUser();
    const { error: reviewError } = await supabase.from("review_actions").insert({
      booking_id: bookingId,
      reviewed_by: userData.user?.email || "admin",
      decision,
    });
    setActionId("");
    if (updateError || reviewError) {
      setError("That review action could not be saved. Please try again.");
      return;
    }
    loadData(true);
  };

  const visible = bookings.filter((booking) => filter === "all" || booking.status === filter);
  const summary = {
    total: bookings.length,
    flagged: bookings.filter((booking) => booking.status === "flagged").length,
    clean: bookings.filter((booking) => booking.status === "clean").length,
    pending: bookings.filter((booking) => booking.status === "pending").length,
  };

  if (!authorized) {
    return <main className="route-loading"><span className="spinner dark-spinner" /> Checking your session...</main>;
  }

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <img src={logo} alt="Trusttix" className="dashboard-logo" />
          <span className="brand-divider" />
          <span className="brand-context">Fraud operations</span>
        </div>
        <div className="topbar-actions">
          <span className="live-status"><span className="status-dot" /> Live</span>
          <button className="ghost-button" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <section className="dashboard-intro">
        <div>
          <p className="eyebrow">Overview / Booking integrity</p>
          <h1>Review queue</h1>
          <p className="intro-copy">Monitor risk signals and resolve bookings that need your attention.</p>
        </div>
        <button className="secondary-button" onClick={() => loadData(true)} disabled={loading || refreshing}>
          <span aria-hidden="true" className={refreshing ? "refresh-icon spinning" : "refresh-icon"}>↻</span>
          {refreshing ? "Refreshing" : "Refresh data"}
        </button>
      </section>

      <section className="summary-grid" aria-label="Booking summary">
        <SummaryCard label="Total bookings" value={summary.total} detail="All activity" icon="◈" />
        <SummaryCard label="Flagged" value={summary.flagged} detail="Needs attention" icon="!" tone="danger" />
        <SummaryCard label="Clean" value={summary.clean} detail="Approved activity" icon="✓" tone="success" />
        <SummaryCard label="Pending review" value={summary.pending} detail="Awaiting decision" icon="◷" tone="warning" />
      </section>

      {error && <div className="dashboard-alert" role="alert"><span aria-hidden="true">!</span>{error}</div>}

      <section className="queue-card">
        <div className="queue-toolbar">
          <div>
            <h2>Booking queue</h2>
            <p>{visible.length} {visible.length === 1 ? "booking" : "bookings"} shown</p>
          </div>
          <div className="filter-tabs" role="group" aria-label="Filter bookings">
            {filters.map((option) => (
              <button key={option} className={filter === option ? "filter-tab active" : "filter-tab"} onClick={() => setFilter(option)} aria-pressed={filter === option}>
                {option}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="table-state"><span className="spinner dark-spinner" /> Loading review queue...</div>
        ) : visible.length === 0 ? (
          <div className="table-state empty-state"><span className="empty-icon">✓</span><strong>No bookings in this view</strong><span>Try another filter or refresh the queue.</span></div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead><tr>{["Booking ID", "Account", "Amount", "Status", "Rule score", "Anomaly", "Reasons", "Actions"].map((heading) => <th key={heading} scope="col">{heading}</th>)}</tr></thead>
              <tbody>
                {visible.map((booking) => {
                  const risk = riskScores[booking.booking_id];
                  const anomaly = anomalyScores[booking.booking_id];
                  return (
                    <tr key={booking.booking_id}>
                      <td className="mono">{booking.booking_id}</td>
                      <td>{booking.account_id}</td>
                      <td className="amount">₹{booking.amount}</td>
                      <td><StatusBadge status={booking.status} /></td>
                      <td><span className="score" style={{ color: riskColor(risk?.score) }}>{risk?.score ?? "-"}</span></td>
                      <td>{anomaly ? <span className={anomaly.is_outlier ? "anomaly outlier" : "anomaly"}>{Number(anomaly.anomaly_score).toFixed(2)}{anomaly.is_outlier ? " !" : ""}</span> : "-"}</td>
                      <td className="reasons">{risk?.reasons?.join(", ") || "-"}</td>
                      <td><div className="row-actions">
                        <button className="action approve" disabled={Boolean(actionId)} onClick={() => act(booking.booking_id, "clean")}>{actionId === `${booking.booking_id}-clean` ? "Saving..." : "Approve"}</button>
                        <button className="action hold" disabled={Boolean(actionId)} onClick={() => act(booking.booking_id, "flagged")}>Hold</button>
                        <button className="action cancel" disabled={Boolean(actionId)} onClick={() => act(booking.booking_id, "cancelled")}>Cancel</button>
                      </div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <footer className="dashboard-footer">Trusttix <span>•</span> Secure fraud operations</footer>
    </main>
  );
}

function SummaryCard({ label, value, detail, icon, tone = "" }) {
  return <article className={`summary-card ${tone}`}><div className="summary-icon">{icon}</div><div><p>{label}</p><strong>{value}</strong><span>{detail}</span></div></article>;
}

function StatusBadge({ status }) {
  return <span className={`status-badge ${status}`}>{status}</span>;
}

function riskColor(score) {
  if (score === undefined || score === null) return "var(--text-muted)";
  if (score >= 60) return "var(--danger)";
  if (score >= 30) return "var(--warning)";
  return "var(--success)";
}
