
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000";

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function loadAccount() {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [userRes, accountRes] = await Promise.all([
          fetch(`${API}/auth/me`, { headers }),
          fetch(`${API}/accounts/me`, { headers }),
        ]);

        if (!userRes.ok || !accountRes.ok) {
          throw new Error("Unable to load account details.");
        }

        const userData = await userRes.json();
        const accountData = await accountRes.json();

        setUser(userData);
        setAccount(accountData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, [token]);

  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  if (loading) {
    return <div className="loading-screen">Loading account...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="bank-app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">B</span>
          <span>BankFlow</span>
        </div>

        <div className="sidebar-label">MENU</div>

        <nav className="sidebar-nav">
          <Link to="/dashboard">Overview</Link>
          <Link to="/transactions">Transactions</Link>
          <Link to="/account" className="active">My Account</Link>
        </nav>

        <button className="logout-button" onClick={logout}>
          Sign out
        </button>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <p className="eyebrow">PERSONAL BANKING</p>
            <h1>My Account</h1>
            <p className="subtitle">
              Manage and view your account information.
            </p>
          </div>
        </header>

        <section className="account-profile-card">
          <div className="profile-avatar">
            {(user?.full_name || "U").charAt(0).toUpperCase()}
          </div>

          <div>
            <h2>{user?.full_name || "BankFlow User"}</h2>
            <p>{user?.email || "Email unavailable"}</p>
            <span className="status-badge">Active Account</span>
          </div>
        </section>

        <section className="account-details-grid">
          <div className="account-detail-card">
            <span className="detail-label">Account Number</span>
            <h3>{account?.account_number || "Unavailable"}</h3>
          </div>

          <div className="account-detail-card">
            <span className="detail-label">Account Balance</span>
            <h3>
              ₹
              {Number(account?.balance || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </h3>
          </div>

          <div className="account-detail-card">
            <span className="detail-label">Account Status</span>
            <h3 className="account-status-text">Active</h3>
          </div>
        </section>

        <section className="account-security-card">
          <div>
            <h3>Account Security</h3>
            <p>Your account is protected by BankFlow authentication.</p>
          </div>
          <span className="security-indicator">Secure</span>
        </section>

        <Link to="/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>
      </main>
    </div>
  );
}
