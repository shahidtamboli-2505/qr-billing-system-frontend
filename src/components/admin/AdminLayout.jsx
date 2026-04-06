import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const navItems = [
  { path: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { path: "/admin/orders", icon: "🧾", label: "Orders" },
  { path: "/admin/billing", icon: "💳", label: "Billing" },
  { path: "/admin/reports", icon: "📈", label: "Reports" },
  { path: "/admin/menu", icon: "🍫", label: "Menu Management" },
  { path: "/admin/settings", icon: "⚙️", label: "Settings" },
];

const AdminLayout = ({ children, title, subtitle }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  return (
    <div style={{ background: "var(--admin-bg)", minHeight: "100vh", display: "flex" }}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        {/* Logo */}
        <div style={{ padding: "1.75rem 1.5rem 1.25rem", borderBottom: "1px solid var(--admin-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "2rem" }}>🧇</span>
            <div>
              <p
                className="font-display"
                style={{ color: "var(--amber-light)", fontSize: "0.95rem", fontWeight: "700", lineHeight: "1.2" }}
              >
                Belgian Bliss
              </p>
              <p style={{ color: "var(--admin-muted)", fontSize: "0.72rem", letterSpacing: "0.08em" }}>
                ADMIN PANEL
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: "1rem 0", flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid var(--admin-border)" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              width: "100%",
              padding: "0.75rem 1.25rem",
              borderRadius: "0.875rem",
              background: "transparent",
              border: "none",
              color: "var(--admin-muted)",
              fontSize: "0.9rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.1)";
              e.currentTarget.style.color = "#f87171";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--admin-muted)";
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content" style={{ flex: 1, padding: "2rem" }}>
        {/* Page Header */}
        {title && (
          <div style={{ marginBottom: "2rem" }} className="animate-fade-in">
            <h1
              className="font-display"
              style={{ color: "var(--admin-text)", fontSize: "2rem", fontWeight: "700" }}
            >
              {title}
            </h1>
            {subtitle && (
              <p style={{ color: "var(--admin-muted)", marginTop: "0.35rem", fontSize: "0.95rem" }}>
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
