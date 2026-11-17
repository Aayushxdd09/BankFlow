import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

const API = "http://127.0.0.1:8000";

export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [demoToken, setDemoToken] = useState("");

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  async function handleLogin(e) {
    e.preventDefault();
    clearMessages();
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

  async function handleForgotPassword(e) {
    e.preventDefault();
    clearMessages();
    setDemoToken("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to generate reset token."
        );
      }

      setDemoToken(data.demo_token);
      setResetToken(data.demo_token);
      setSuccess(data.message);
      setMode("reset");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    clearMessages();

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: resetToken,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Password reset failed."
        );
      }

      setSuccess(data.message);
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setResetToken("");
      setDemoToken("");
      setMode("login");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function goToLogin() {
    setMode("login");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
    setDemoToken("");
    clearMessages();
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

            {mode === "login" && (
              <>
                <h2>Sign in</h2>
                <p>Access your account and manage your money.</p>
              </>
            )}

            {mode === "forgot" && (
              <>
                <h2>Forgot password?</h2>
                <p>
                  Enter your registered email address to generate
                  a password reset token.
                </p>
              </>
            )}

            {mode === "reset" && (
              <>
                <h2>Reset password</h2>
                <p>Create a new password for your BankFlow account.</p>
              </>
            )}
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          {mode === "login" && (
            <>
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

                <div style={{ textAlign: "right", marginTop: "-8px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      clearMessages();
                      setMode("forgot");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#087f5b",
                      cursor: "pointer",
                      fontWeight: 600,
                      padding: "4px 0",
                    }}
                  >
                    Forgot password?
                  </button>
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
            </>
          )}

          {mode === "forgot" && (
            <form
              className="auth-form"
              onSubmit={handleForgotPassword}
            >
              <div className="form-group">
                <label htmlFor="forgot-email">Registered email address</label>

                <input
                  id="forgot-email"
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                className="auth-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? "Generating token..." : "Generate reset token →"}
              </button>

              <button
                type="button"
                onClick={goToLogin}
                style={{
                  width: "100%",
                  marginTop: "16px",
                  background: "none",
                  border: "none",
                  color: "#087f5b",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                ← Back to login
              </button>
            </form>
          )}

          {mode === "reset" && (
            <form
              className="auth-form"
              onSubmit={handleResetPassword}
            >
              {demoToken && (
                <div className="form-group">
                  <label htmlFor="demo-token">
                    Local demonstration reset token
                  </label>

                  <textarea
                    id="demo-token"
                    className="form-input"
                    value={demoToken}
                    readOnly
                    rows={3}
                    style={{ resize: "vertical", fontSize: "12px" }}
                  />

                  <p style={{ fontSize: "12px", color: "#718096" }}>
                    This token is generated locally instead of being
                    sent through email.
                  </p>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="reset-token">Reset token</label>

                <input
                  id="reset-token"
                  className="form-input"
                  type="text"
                  placeholder="Enter reset token"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="new-password">New password</label>

                <input
                  id="new-password"
                  className="form-input"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">
                  Confirm new password
                </label>

                <input
                  id="confirm-password"
                  className="form-input"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                className="auth-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? "Resetting password..." : "Reset password →"}
              </button>

              <button
                type="button"
                onClick={goToLogin}
                style={{
                  width: "100%",
                  marginTop: "16px",
                  background: "none",
                  border: "none",
                  color: "#087f5b",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                ← Back to login
              </button>
            </form>
          )}
        </section>
      </div>

      <footer className="auth-footer">
        BANKFLOW · SIMPLE BANKING, DONE RIGHT
      </footer>
    </div>
  );
}