
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000";

export default function Transactions() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const token = localStorage.getItem("token");

  async function loadTransactions() {
    try {
      setLoading(true);
      setError("");

      const url = new URL(`${API}/transactions/history`);
      url.searchParams.set("page", "1");
      url.searchParams.set("page_size", "100");

      if (filter !== "all") {
        url.searchParams.set("transaction_type", filter);
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load transactions.");
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  function formatDate(date) {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function formatAmount(amount) {
    return Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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
          <Link to="/transactions" className="active">Transactions</Link>
          <Link to="/account">My Account</Link>
        </nav>

        <button className="logout-button" onClick={logout}>
          Sign out
        </button>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <p className="eyebrow">ACTIVITY</p>
            <h1>Transactions</h1>
            <p className="subtitle">
              View and track all your account transactions.
            </p>
          </div>
        </header>

        <section className="transactions-card">
          <div className="transactions-toolbar">
            <div>
              <h2>Transaction History</h2>
              <p className="subtitle">Your recent banking activity</p>
            </div>

            <select
              className="transaction-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All transactions</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="transfer">Transfers</option>
            </select>
          </div>

          {loading ? (
            <div className="empty-state">Loading transactions...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">↗</div>
              <h3>No transactions found</h3>
              <p>Your transactions will appear here.</p>
            </div>
          ) : (
            <div className="transaction-list">
              {transactions.map((transaction) => {
                const type = transaction.transaction_type?.toLowerCase();
                const isCredit = type === "deposit" || type === "received";

                return (
                  <div
                    className="transaction-row"
                    key={transaction.transaction_reference}
                  >
                    <div className="transaction-icon">
                      {isCredit ? "↓" : "↑"}
                    </div>

                    <div className="transaction-info">
                      <h3>
                        {transaction.description ||
                          transaction.transaction_type}
                      </h3>
                      <p>{formatDate(transaction.created_at)}</p>
                      <span className="transaction-reference">
                        Ref: {transaction.transaction_reference}
                      </span>
                    </div>

                    <div className="transaction-amount">
                      <strong className={isCredit ? "credit" : "debit"}>
                        {isCredit ? "+" : "-"}₹
                        {formatAmount(transaction.amount)}
                      </strong>
                      <span className="transaction-status">
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <Link to="/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>
      </main>
    </div>
  );
}

