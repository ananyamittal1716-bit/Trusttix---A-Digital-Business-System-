import logo from "./assets/Logo.jpeg";
import { useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Invalid email or password");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0c0c0e",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: "#151517",
          border: "1px solid #232326",
          borderRadius: 14,
          padding: "40px 36px",
          width: 340,
        }}
      >
       <img src={logo} alt="Trusttix" style={{ width: 120, display: "block", margin: "0 auto 8px" }} />
<p style={{ color: "#888", fontSize: 13, textAlign: "center", marginTop: 0, marginBottom: 28 }}>
  Fraud-Operations Admin Console
</p>

        <label style={{ color: "#aaa", fontSize: 12 }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <label style={{ color: "#aaa", fontSize: 12 }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            marginTop: 20,
            background: "#e5484d",
            color: "#0c0c0e",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            cursor: "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        {error && (
          <p style={{ color: "#e5484d", fontSize: 13, textAlign: "center", marginTop: 14 }}>{error}</p>
        )}
      </form>
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px 12px",
  marginTop: 6,
  marginBottom: 16,
  background: "#0c0c0e",
  border: "1px solid #333",
  borderRadius: 8,
  color: "#e6e6e6",
  fontSize: 14,
  boxSizing: "border-box",
};
