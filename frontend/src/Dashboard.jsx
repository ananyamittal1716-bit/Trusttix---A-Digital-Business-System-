import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import logo from "./assets/Logo.jpeg";

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [riskScores, setRiskScores] = useState({});
  const [anomalyScores, setAnomalyScores] = useState({});
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const [bookingsResult, riskResult, anomalyResult] = await Promise.all([
        supabase.from("bookings").select("*"),
        supabase.from("risk_scores").select("*"),
        supabase.from("anomaly_scores").select("*"),
      ]);

      const dataError = bookingsResult.error || riskResult.error || anomalyResult.error;
      if (dataError) throw dataError;

      const bookingsData = bookingsResult.data;
      const riskData = riskResult.data;
      const anomalyData = anomalyResult.data;

      setBookings(bookingsData || []);

      const riskMap = {};
      (riskData || []).forEach((r) => (riskMap[r.booking_id] = r));
      setRiskScores(riskMap);

      const anomalyMap = {};
      (anomalyData || []).forEach((a) => (anomalyMap[a.booking_id] = a));
      setAnomalyScores(anomalyMap);
    } catch {
      setLoadError("Unable to load booking data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const act = async (bookingId, decision) => {
    await supabase.from("bookings").update({ status: decision }).eq("booking_id", bookingId);
    await supabase.from("review_actions").insert({
      booking_id: bookingId,
      reviewed_by: (await supabase.auth.getUser()).data.user?.email || "admin",
      decision: decision,
    });
    loadData();
  };

  const visible = bookings.filter((b) => filter === "all" || b.status === filter);

  const riskColor = (score) => {
    if (score === undefined || score === null) return "#555";
    if (score >= 60) return "#e5484d";
    if (score >= 30) return "#f5a623";
    return "#3dd68c";
  };

  const statusBadge = (status) => {
    const colors = {
      pending: "#8a8a8a",
      clean: "#3dd68c",
      flagged: "#e5484d",
      cancelled: "#555",
    };
    return (
      <span
        style={{
          background: colors[status] || "#555",
          color: "#0c0c0e",
          padding: "3px 10px",
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 600,
          textTransform: "uppercase",
        }}
      >
        {status}
      </span>
    );
  };

  const summary = {
    total: bookings.length,
    flagged: bookings.filter((b) => b.status === "flagged").length,
    clean: bookings.filter((b) => b.status === "clean").length,
    pending: bookings.filter((b) => b.status === "pending").length,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0c0c0e",
        color: "#e6e6e6",
        fontFamily: "'Segoe UI', sans-serif",
        padding: "32px 40px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <img src={logo} alt="Trusttix" style={{ height: 40, display: "block", marginBottom: 6 }} />
<p style={{ margin: "4px 0 0", color: "#888", fontSize: 13 }}>
  Ticket Integrity & Fraud Review Console
</p>
        </div>
        <button
          onClick={() => supabase.auth.signOut().then(() => (window.location.href = "/trusttix/"))}
          style={{
            background: "transparent",
            border: "1px solid #333",
            color: "#aaa",
            padding: "8px 16px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Bookings", value: summary.total, color: "#e6e6e6" },
          { label: "Flagged", value: summary.flagged, color: "#e5484d" },
          { label: "Clean", value: summary.clean, color: "#3dd68c" },
          { label: "Pending Review", value: summary.pending, color: "#f5a623" },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: "#151517",
              border: "1px solid #232326",
              borderRadius: 12,
              padding: "16px 22px",
              flex: 1,
            }}
          >
            <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>{card.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {["all", "pending", "clean", "flagged", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? "#e5484d" : "#151517",
              color: filter === f ? "#0c0c0e" : "#ccc",
              border: "1px solid #232326",
              padding: "8px 16px",
              borderRadius: 8,
              cursor: "pointer",
              textTransform: "capitalize",
              fontWeight: filter === f ? 700 : 400,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ background: "#151517", border: "1px solid #232326", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#1c1c1f", textAlign: "left" }}>
              {["Booking ID", "Account", "Amount", "Status", "Rule Score", "Anomaly Score", "Reasons", "Actions"].map(
                (h) => (
                  <th key={h} style={{ padding: "12px 16px", color: "#888", fontWeight: 600 }}>
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="8" style={tableMessageStyle} aria-live="polite">Loading bookings…</td>
              </tr>
            )}
            {!isLoading && loadError && (
              <tr>
                <td colSpan="8" style={tableMessageStyle} role="alert">
                  {loadError} <button onClick={loadData} style={retryBtn}>Retry</button>
                </td>
              </tr>
            )}
            {!isLoading && !loadError && visible.length === 0 && (
              <tr>
                <td colSpan="8" style={tableMessageStyle}>
                  No {filter === "all" ? "bookings" : `${filter} bookings`} to review.
                </td>
              </tr>
            )}
            {!isLoading && !loadError && visible.map((b, i) => {
              const risk = riskScores[b.booking_id];
              const anomaly = anomalyScores[b.booking_id];
              return (
                <tr
                  key={b.booking_id}
                  style={{
                    borderTop: "1px solid #232326",
                    background: i % 2 === 0 ? "transparent" : "#131315",
                  }}
                >
                  <td style={{ padding: "12px 16px", fontFamily: "monospace" }}>{b.booking_id}</td>
                  <td style={{ padding: "12px 16px" }}>{b.account_id}</td>
                  <td style={{ padding: "12px 16px" }}>₹{b.amount}</td>
                  <td style={{ padding: "12px 16px" }}>{statusBadge(b.status)}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ color: riskColor(risk?.score), fontWeight: 700 }}>
                      {risk?.score ?? "-"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {anomaly ? (
                      <span style={{ color: anomaly.is_outlier ? "#e5484d" : "#888" }}>
                        {Number(anomaly.anomaly_score).toFixed(2)}
                        {anomaly.is_outlier ? " ⚠" : ""}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#999", maxWidth: 220 }}>
                    {risk?.reasons?.join(", ") || "-"}
                  </td>
                  <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                    <button onClick={() => act(b.booking_id, "clean")} style={actionBtn("#3dd68c")}>
                      Approve
                    </button>
                    <button onClick={() => act(b.booking_id, "flagged")} style={actionBtn("#f5a623")}>
                      Hold
                    </button>
                    <button onClick={() => act(b.booking_id, "cancelled")} style={actionBtn("#e5484d")}>
                      Cancel
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function actionBtn(color) {
  return {
    background: "transparent",
    border: `1px solid ${color}`,
    color: color,
    padding: "5px 10px",
    borderRadius: 6,
    marginRight: 6,
    cursor: "pointer",
    fontSize: 12,
  };
}

const tableMessageStyle = {
  padding: "32px 16px",
  textAlign: "center",
  color: "#aaa",
};

const retryBtn = {
  background: "transparent",
  border: "1px solid #e5484d",
  borderRadius: 6,
  color: "#e5484d",
  cursor: "pointer",
  marginLeft: 8,
  padding: "4px 8px",
};
