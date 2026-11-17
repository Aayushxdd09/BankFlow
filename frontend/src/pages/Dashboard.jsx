
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

const API = "http://127.0.0.1:8000";

const money = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function Dashboard() {
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState("");
  const [amount, setAmount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  async function loadDashboard() {
    const token = localStorage.getItem("token");

    if (!token) {
      logout();
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const responses = await Promise.all([
        fetch(`${API}/accounts/me`, { headers }),
        fetch(`${API}/auth/me`, { headers }),
        fetch(`${API}/transactions/history?page=1&page_size=5`, {
          headers,
        }),
        fetch(`${API}/transactions/summary`, { headers }),
      ]);

      if (responses.some((r) => r.status === 401)) {
        logout();
        return;
      }

      if (responses.some((r) => !r.ok)) {
        throw new Error("Unable to load dashboard.");
      }

      const data = await Promise.all(
        responses.map((r) => r.json())
      );

      setAccount(data[0]);
      setUser(data[1]);
      setTransactions(data[2].transactions || []);
      setSummary(data[3]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function openModal(type) {
    setModal(type);
    setAmount("");
    setReceiver("");
    setMessage("");
    setError("");
  }

  async function handleTransaction(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (Number(amount) <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    if (modal === "transfer" && !receiver.trim()) {
      setError("Enter recipient account number.");
      return;
    }

    const endpoints = {
      deposit: "/transactions/deposit",
      withdraw: "/transactions/withdraw",
      transfer: "/transactions/transfer",
    };

    const payload =
      modal === "transfer"
        ? {
            amount: Number(amount),
            receiver_account_number: receiver.trim(),
          }
        : { amount: Number(amount) };

    setProcessing(true);

    try {
      const response = await fetch(API + endpoints[modal], {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Transaction failed."
        );
      }

      setMessage(`${modal} successful!`);
      setAmount("");
      setReceiver("");

      await loadDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return <div className="loading-screen">Loading dashboard...</div>;
  }

  return (
    <div className="bank-app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">B</span>
          BankFlow
        </div>

        <div className="sidebar-label">MENU</div>

        <nav className="sidebar-nav">
          <Link className="active" to="/dashboard">
            Overview
          </Link>

          <Link to="/transactions">
            Transactions
          </Link>

          <Link to="/account">
            My Account
          </Link>
        </nav>

        <button className="logout-button" onClick={logout}>
          Sign out
        </button>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <p className="eyebrow">YOUR FINANCES</p>
            <h1>Overview</h1>
            <p className="subtitle">
              Welcome back, {user?.full_name || "User"}.
            </p>
          </div>

          <div className="profile-avatar">
            {user?.full_name?.charAt(0)?.toUpperCase() || "B"}
          </div>
        </header>

        {error && !modal && (
          <div className="error-message">{error}</div>
        )}

        <section className="balance-card">
          <p className="eyebrow">BANKFLOW ACCOUNT</p>

          <div className="balance-label">Available balance</div>

          <h2 className="balance-amount">
            ₹ {money(account?.balance)}
          </h2>

          <small className="account-number">
            Account · {account?.account_number || "Loading..."}
          </small>
        </section>

        <div className="section-heading">
          <h2>Quick actions</h2>
        </div>

        <div className="quick-actions">
          <button
            className="action-button primary"
            onClick={() => openModal("deposit")}
          >
            ＋ Deposit
          </button>

          <button
            className="action-button secondary"
            onClick={() => openModal("withdraw")}
          >
            ↗ Withdraw
          </button>

          <button
            className="action-button secondary"
            onClick={() => openModal("transfer")}
          >
            ⇄ Transfer
          </button>
        </div>

        <div className="section-heading">
          <h2>Financial summary</h2>

          <Link to="/transactions">
            View activity →
          </Link>
        </div>

        <div className="summary-grid">
          {[
            ["Deposits", summary?.total_deposits],
            ["Withdrawals", summary?.total_withdrawals],
            ["Transfers sent", summary?.total_transfers_sent],
            ["Transfers received", summary?.total_transfers_received],
          ].map(([label, value]) => (
            <div className="summary-card" key={label}>
              <div className="summary-label">
                <span className="summary-dot" />
                {label}
              </div>

              <div className="summary-value">
                ₹ {money(value)}
              </div>
            </div>
          ))}
        </div>

        <div className="section-heading">
          <h2>Recent transactions</h2>

          <Link to="/transactions">
            See all →
          </Link>
        </div>

        <section className="transactions-card">
          {transactions.length === 0 ? (
            <div className="empty-state">
              No transactions yet.
            </div>
          ) : (
            <div className="transaction-list">
              {transactions.map((txn) => (
                <TransactionItem
                  key={txn.id || txn.transaction_reference}
                  txn={txn}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {modal && (
        <div
          className="modal-overlay"
          onClick={() => !processing && setModal("")}
        >
          <section
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => !processing && setModal("")}
            >
              ×
            </button>

            <p className="eyebrow">BANKFLOW</p>

            <h2>
              {modal === "deposit"
                ? "Deposit money"
                : modal === "withdraw"
                ? "Withdraw money"
                : "Transfer money"}
            </h2>

            <p className="subtitle">
              {modal === "transfer"
                ? "Send money to another BankFlow account."
                : "Enter the amount you want to process."}
            </p>

            {message && (
              <div className="success-message">{message}</div>
            )}

            {error && (
              <div className="error-message">{error}</div>
            )}

            <form onSubmit={handleTransaction}>
              {modal === "transfer" && (
                <div className="form-group">
                  <label>Recipient account number</label>

                  <input
                    className="form-input"
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                    placeholder="Account number"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Amount (₹)</label>

                <input
                  className="form-input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <button
                className="action-button primary modal-submit"
                disabled={processing}
              >
                {processing
                  ? "Processing..."
                  : modal.charAt(0).toUpperCase() + modal.slice(1)}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function TransactionItem({ txn }) {
  const incoming =
    txn.transaction_type === "DEPOSIT" ||
    String(txn.description || "").startsWith("Received from");

  return (
    <div className="transaction-row">
      <div className="transaction-icon">
        {txn.transaction_type === "DEPOSIT"
          ? "＋"
          : txn.transaction_type === "WITHDRAWAL"
          ? "−"
          : "↔"}
      </div>

      <div className="transaction-info">
        <h3>
          {String(txn.transaction_type || "").replaceAll("_", " ")}
        </h3>

        <p>
          {txn.created_at
            ? new Date(txn.created_at).toLocaleDateString("en-IN")
            : ""}
        </p>

        <span className="transaction-reference">
          Ref: {txn.transaction_reference}
        </span>
      </div>

      <div className="transaction-amount">
        <strong className={incoming ? "credit" : "debit"}>
          {incoming ? "+" : "−"}₹{money(txn.amount)}
        </strong>

        <span className="transaction-status">
          {txn.status || "SUCCESS"}
        </span>
      </div>
    </div>
  );
}
