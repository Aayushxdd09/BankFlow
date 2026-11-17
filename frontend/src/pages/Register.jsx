
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

const API = "http://127.0.0.1:8000";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Registration failed."
        );
      }

      navigate("/");
    } catch (err) {
      setError(
        err.message || "Unable to connect to BankFlow server."
      );
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
          <span className="eyebrow">GET STARTED</span>

          <h1>
            A better way
            <br />
            to bank.
          </h1>

          <p>
            Your banking journey starts here.
            <br />
            Simple, secure, and designed around you.
          </p>

          <div className="auth-decoration">
            <div className="auth-circle circle-one" />
            <div className="auth-circle circle-two" />

            <div className="auth-mini-card">
              <span>Welcome to BankFlow</span>
              <strong>Your money. Your control.</strong>

              <div className="auth-card-bottom">
                <span>•••• •••• •••• 2026</span>
                <span>BANK</span>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-right">
          <div className="auth-form-header">
            <span className="eyebrow">PERSONAL BANKING</span>
            <h2>Create account</h2>
            <p>Fill in your details to get started.</p>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="full_name">Full name</label>

              <input
                id="full_name"
                className="form-input"
                name="full_name"
                placeholder="Your full name"
                value={form.full_name}
                onChange={updateField}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register_email">Email address</label>

              <input
                id="register_email"
                className="form-input"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={updateField}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone number</label>

              <input
                id="phone"
                className="form-input"
                name="phone"
                type="tel"
                placeholder="Your phone number"
                value={form.phone}
                onChange={updateField}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register_password">Password</label>

              <input
                id="register_password"
                className="form-input"
                name="password"
                type="password"
                placeholder="Create a password"
                value={form.password}
                onChange={updateField}
                required
              />
            </div>

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account →"}
            </button>
          </form>

          <div className="auth-register">
            Already have an account?
            <Link to="/">Sign in</Link>
          </div>
        </section>
      </div>

      <footer className="auth-footer">
        BANKFLOW · SIMPLE BANKING, DONE RIGHT
      </footer>
    </div>
  );
}

