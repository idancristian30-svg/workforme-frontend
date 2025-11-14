import React, { useState, useEffect } from "react";

const API_BASE = "/api";

export default function App() {
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return token && user ? { token, user: JSON.parse(user) } : null;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setSession(null);
  };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.header}>
          <div style={styles.brand}>
            <div style={styles.logoDot} />
            <div>
              <div style={styles.logoText}>WorkForMe</div>
              <div style={styles.logoSub}>Instant jobs. Real people.</div>
            </div>
          </div>

          {session && (
            <div style={styles.userBox}>
              <div style={styles.userInfo}>
                <div style={styles.userName}>{session.user.name}</div>
                <div style={styles.userRole}>{session.user.role}</div>
              </div>
              <button style={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </header>

        {!session ? (
          <div style={styles.grid}>
            <div style={styles.hero}>
              <h1 style={styles.heroTitle}>
                Gigs today, <span style={styles.heroHighlight}>freedom</span> tomorrow.
              </h1>
              <p style={styles.heroText}>
                Conecteaza angajatori si oameni disponibili pentru joburi rapide.
                Totul intr-o experienta inspirata din design-ul Apple.
              </p>
              <ul style={styles.heroList}>
                <li>⚡ Postezi un job in <b>30 de secunde</b></li>
                <li>📍 Filtrezi dupa locatie si tip de job</li>
                <li>🔒 Autentificare securizata cu token JWT</li>
              </ul>
            </div>
            <div style={styles.authWrapper}>
              <AuthCard onLogin={setSession} />
            </div>
          </div>
        ) : (
          <main style={styles.grid}>
            {session.user.role === "employer" && (
              <div style={styles.column}>
                <JobForm token={session.token} />
              </div>
            )}
            <div style={styles.column}>
              <JobList />
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

/* AUTH CARD */

function AuthCard({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employer",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");
      }

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin({ token: data.token, user: data.user });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.pillRow}>
          <div
            style={{
              ...styles.modePill,
              ...(mode === "login" ? styles.modePillActive : {}),
            }}
            onClick={() => setMode("login")}
          >
            Login
          </div>
          <div
            style={{
              ...styles.modePill,
              ...(mode === "register" ? styles.modePillActive : {}),
            }}
            onClick={() => setMode("register")}
          >
            Register
          </div>
        </div>
      </div>

      <form style={styles.form} onSubmit={handleSubmit}>
        {mode === "register" && (
          <>
            <label style={styles.label}>
              Name
              <input
                style={styles.input}
                name="name"
                value={form.name}
                onChange={change}
                required
              />
            </label>
            <label style={styles.label}>
              Role
              <select
                style={styles.input}
                name="role"
                value={form.role}
                onChange={change}
              >
                <option value="employer">Employer</option>
                <option value="worker">Worker</option>
              </select>
            </label>
          </>
        )}
        <label style={styles.label}>
          Email
          <input
            style={styles.input}
            type="email"
            name="email"
            value={form.email}
            onChange={change}
            required
          />
        </label>
        <label style={styles.label}>
          Password
          <input
            style={styles.input}
            type="password"
            name="password"
            value={form.password}
            onChange={change}
            required
          />
        </label>
        {error && <div style={styles.error}>{error}</div>}
        <button style={styles.primaryBtn} type="submit" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
        </button>
      </form>
    </div>
  );
}

/* JOB FORM */

function JobForm({ token }) {
  const [job, setJob] = useState({
    title: "",
    description: "",
    location: "",
    hourlyRate: "",
    currency: "EUR",
    category: "general",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const change = (e) => setJob({ ...job, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          ...job,
          hourlyRate: job.hourlyRate ? Number(job.hourlyRate) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create job");

      setJob({
        title: "",
        description: "",
        location: "",
        hourlyRate: "",
        currency: "EUR",
        category: "general",
      });
      alert("Job posted successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Posteaza un job</h2>
      <p style={styles.cardSubtitle}>
        Define rapid ce ai nevoie, iar oamenii potriviti pot aplica.
      </p>
      <form style={styles.form} onSubmit={handleSubmit}>
        <label style={styles.label}>
          Titlu job
          <input
            style={styles.input}
            name="title"
            value={job.title}
            onChange={change}
            required
          />
        </label>
        <label style={styles.label}>
          Descriere
          <textarea
            style={{ ...styles.input, minHeight: 70, resize: "vertical" }}
            name="description"
            value={job.description}
            onChange={change}
            required
          />
        </label>
        <label style={styles.label}>
          Locatie
          <input
            style={styles.input}
            name="location"
            value={job.location}
            onChange={change}
            placeholder="Ex: Bucuresti sau Remote"
          />
        </label>
        <div style={styles.row}>
          <label style={{ ...styles.label, flex: 1 }}>
            Tarifa orara
            <input
              style={styles.input}
              name="hourlyRate"
              value={job.hourlyRate}
              onChange={change}
              placeholder="Ex: 80"
            />
          </label>
          <label style={{ ...styles.label, width: 120 }}>
            Moneda
            <select
              style={styles.input}
              name="currency"
              value={job.currency}
              onChange={change}
            >
              <option value="EUR">EUR</option>
              <option value="RON">RON</option>
              <option value="USD">USD</option>
            </select>
          </label>
        </div>
        <label style={styles.label}>
          Categoria
          <select
            style={styles.input}
            name="category"
            value={job.category}
            onChange={change}
          >
            <option value="general">General</option>
            <option value="construction">Constructii</option>
            <option value="it">IT</option>
            <option value="delivery">Curierat/Livrare</option>
            <option value="office">Office/Administrativ</option>
          </select>
        </label>
        {error && <div style={styles.error}>{error}</div>}
        <button style={styles.primaryBtn} type="submit" disabled={saving}>
          {saving ? "Se salveaza..." : "Posteaza job"}
        </button>
      </form>
    </div>
  );
}

/* JOB LIST */

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/jobs`);
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error("Failed to load jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={styles.card}>
      <div style={styles.listHeader}>
        <div>
          <h2 style={styles.cardTitle}>Joburi active</h2>
          <p style={styles.cardSubtitle}>
            Vezi joburile postate recent si filtreaza mental ce te intereseaza.
          </p>
        </div>
        <button style={styles.secondaryBtn} onClick={load}>
          Refresh
        </button>
      </div>
      {loading && <div style={styles.muted}>Se incarca...</div>}
      {!loading && jobs.length === 0 && (
        <div style={styles.muted}>Nu exista inca joburi postate.</div>
      )}
      <div style={styles.jobList}>
        {jobs.map((job) => (
          <div key={job.id} style={styles.jobCard}>
            <div style={styles.jobHeader}>
              <div style={styles.jobTitle}>{job.title}</div>
              <div style={styles.jobBadge}>{job.category}</div>
            </div>
            <div style={styles.jobMeta}>
              {job.location || "Remote"} •{" "}
              {job.hourlyRate
                ? `${job.hourlyRate} ${job.currency}/h`
                : "Tarif la intelegere"}
            </div>
            <div style={styles.jobDescription}>{job.description}</div>
            <div style={styles.jobFooter}>
              <span style={styles.jobCreator}>
                Postat de {job.createdBy?.name || "Anonim"}
              </span>
              <span style={styles.jobStatus}>{job.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* STILURI C3 – Apple Dynamic */

const styles = {
  page: {
    minHeight: "100vh",
    margin: 0,
    padding: 24,
    background:
      "linear-gradient(135deg, #fdfbfb 0%, #ebedee 40%, #e0e7ff 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'SF Pro Display', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  shell: {
    width: "100%",
    maxWidth: 1100,
    borderRadius: 32,
    background: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(24px)",
    boxShadow: "0 24px 60px rgba(15,23,42,0.18)",
    padding: 24,
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoDot: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    background:
      "radial-gradient(circle at 30% 30%, #ffffff 0, #4f46e5 40%, #0ea5e9 100%)",
    boxShadow: "0 0 12px rgba(59,130,246,0.7)",
  },
  logoText: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: 0.4,
  },
  logoSub: {
    fontSize: 12,
    color: "#6b7280",
  },
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  userInfo: {
    textAlign: "right",
  },
  userName: {
    fontSize: 14,
    fontWeight: 600,
  },
  userRole: {
    fontSize: 12,
    color: "#6b7280",
    textTransform: "capitalize",
  },
  logoutBtn: {
    padding: "6px 14px",
    borderRadius: 999,
    border: "none",
    background: "rgba(239,68,68,0.95)",
    color: "white",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr)",
    gap: 20,
    marginTop: 8,
  },
  column: {
    minWidth: 0,
  },
  hero: {
    padding: 20,
  },
  heroTitle: {
    fontSize: 30,
    margin: 0,
    marginBottom: 10,
    lineHeight: 1.1,
  },
  heroHighlight: {
    background: "linear-gradient(135deg,#6366f1,#22c1c3)",
    WebkitBackgroundClip: "text",
    color: "transparent",
  },
  heroText: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 14,
  },
  heroList: {
    paddingLeft: 18,
    fontSize: 13,
    color: "#374151",
    margin: 0,
  },
  authWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    borderRadius: 24,
    background:
      "radial-gradient(circle at 0 0, rgba(255,255,255,0.9), rgba(248,250,252,0.9))",
    boxShadow:
      "0 18px 40px rgba(15,23,42,0.12), 0 1px 0 rgba(255,255,255,0.8) inset",
    padding: 18,
    boxSizing: "border-box",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    margin: 0,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    margin: 0,
    marginBottom: 10,
  },
  pillRow: {
    display: "flex",
    background: "#e5e7eb",
    borderRadius: 999,
    padding: 3,
    gap: 3,
  },
  modePill: {
    flex: 1,
    fontSize: 12,
    padding: "5px 0",
    borderRadius: 999,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    textAlign: "center",
    fontWeight: 500,
  },
  modePillActive: {
    background: "white",
    boxShadow: "0 1px 4px rgba(15,23,42,0.15)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 8,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    fontSize: 12,
    color: "#4b5563",
  },
  input: {
    borderRadius: 14,
    border: "1px solid #d1d5db",
    padding: "9px 11px",
    fontSize: 13,
    outline: "none",
    background: "rgba(255,255,255,0.95)",
  },
  primaryBtn: {
    marginTop: 4,
    borderRadius: 999,
    padding: "10px 0",
    border: "none",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    background: "linear-gradient(135deg,#4f46e5,#0ea5e9)",
    color: "white",
    boxShadow: "0 10px 25px rgba(59,130,246,0.35)",
  },
  secondaryBtn: {
    borderRadius: 999,
    padding: "7px 12px",
    border: "1px solid #d1d5db",
    fontSize: 12,
    background: "white",
    cursor: "pointer",
  },
  error: {
    fontSize: 12,
    color: "#b91c1c",
    background: "#fee2e2",
    borderRadius: 10,
    padding: "6px 8px",
  },
  row: {
    display: "flex",
    gap: 8,
  },
  listHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 6,
  },
  muted: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 6,
  },
  jobList: {
    marginTop: 8,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  jobCard: {
    borderRadius: 18,
    padding: 12,
    background: "rgba(255,255,255,0.95)",
    boxShadow: "0 10px 25px rgba(148,163,184,0.25)",
  },
  jobHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: 600,
  },
  jobBadge: {
    fontSize: 11,
    padding: "3px 8px",
    borderRadius: 999,
    background: "rgba(59,130,246,0.08)",
    color: "#1d4ed8",
    textTransform: "capitalize",
  },
  jobMeta: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  jobDescription: {
    fontSize: 12,
    color: "#374151",
    marginBottom: 6,
  },
  jobFooter: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11,
    color: "#6b7280",
  },
  jobCreator: {},
  jobStatus: {
    textTransform: "capitalize",
  },
};
