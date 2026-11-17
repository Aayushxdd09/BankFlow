
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

const API = "http://127.0.0.1:8000";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Invalid email or password."
        );
      }

      localStorage.setItem("token", data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <span className="brand-icon">B</span>
        BankFlow
      </div>

      <div className="auth-container">
        <section className="auth-left">
          <span className="eyebrow">WELCOME BACK</span>

          <h1>
            Your money.
            <br />
            Your control.
          </h1>

          <p>
            Banking that keeps things simple.
            <br />
            Secure, seamless, and always in your hands.
          </p>

          <div className="auth-decoration">
            <div className="auth-circle circle-one" />
            <div className="auth-circle circle-two" />
            <div className="auth-mini-card">
              <span>BankFlow Account</span>
              <strong>Banking made simple.</strong>
              <div className="auth-card-bottom">
                <span>•••• •••• •••• 2026</span>
                <span>VISA</span>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-right">
          <div className="auth-form-header">
            <span className="eyebrow">PERSONAL BANKING</span>
            <h2>Sign in</h2>
            <p>Access your account and manage your money.</p>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="form-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <div className="auth-register">
            Don't have an account?
            <Link to="/register">Create one</Link>
          </div>
        </section>
      </div>

      <footer className="auth-footer">
        BANKFLOW · SIMPLE BANKING, DONE RIGHT
      </footer>
    </div>
  );
}
