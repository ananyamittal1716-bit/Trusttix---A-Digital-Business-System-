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

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) {
        setError("We couldn't sign you in. Check your email and password and try again.");
        return;
      }
      navigate("/dashboard");
    } catch {
      setError("Sign-in is unavailable right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-panel" aria-labelledby="login-title">
        <div className="auth-brand">
          <img src={logo} alt="Trusttix" className="auth-logo" />
          <span className="status-dot" aria-hidden="true" />
          <span>Operations console</span>
        </div>

        <div className="auth-heading">
          <p className="eyebrow">Secure workspace</p>
          <h1 id="login-title">Welcome back</h1>
          <p>Sign in to review booking integrity and protect every transaction.</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="field">
            <label htmlFor="email">Work email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={loading}
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>

          <div className="field">
            <div className="field-label-row">
              <label htmlFor="password">Password</label>
              <span className="field-hint">Required</span>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={loading}
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>

          {error && (
            <div id="login-error" className="form-alert" role="alert">
              <span aria-hidden="true">!</span>
              {error}
            </div>
          )}

          <button type="submit" className="primary-button auth-submit" disabled={loading}>
            {loading ? <><span className="spinner" aria-hidden="true" /> Signing in...</> : "Sign in to Trusttix"}
          </button>
        </form>

        <p className="auth-footer">Access is restricted to authorized fraud-operations teams.</p>
      </section>
      <aside className="auth-aside" aria-label="Trusttix overview">
        <div className="aside-glow" />
        <p className="eyebrow">Trust, verified</p>
        <h2>Make every booking feel safe.</h2>
        <p>One calm, focused view for the signals that matter most to your team.</p>
        <div className="aside-metrics">
          <span><strong>24/7</strong> monitoring</span>
          <span><strong>Real-time</strong> risk signals</span>
        </div>
      </aside>
    </main>
  );
}
