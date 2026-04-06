import { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { SHOP_NAME } from "../../utils/constants";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const [wiping, setWiping] = useState(false);

  const handleWipeOrders = async () => {
    const confirm1 = window.confirm("⚠️ DANGER: This will permanently delete ALL orders, billing history, and reports. Are you absolutely sure?");
    if (!confirm1) return;

    const confirm2 = window.prompt("Type 'RESET' to confirm deleting all orders:");
    if (confirm2 !== "RESET") {
      toast.error("Database reset cancelled.");
      return;
    }

    setWiping(true);
    const toastId = toast.loading("Wiping all orders from database...");
    try {
      // Delete all order items and then orders safely
      await supabase.from('order_items').delete().not('order_id', 'is', null);
      await supabase.from('orders').delete().not('id', 'is', null);

      toast.success("Database reset to 0 successfully! 🎉", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear database. Check console.", { id: toastId });
    } finally {
      setWiping(false);
    }
  };

  return (
    <AdminLayout title="Settings" subtitle="Shop & system configuration">
      <div style={{ display: "grid", gap: "1.5rem", maxWidth: "640px" }}>
        {/* Shop Info */}
        <div className="admin-card">
          <h2 className="font-display" style={{ color: "var(--admin-text)", fontSize: "1.1rem", fontWeight: "700", marginBottom: "1.25rem" }}>
            🏪 Shop Information
          </h2>
          <div style={{ display: "grid", gap: "0.875rem" }}>
            {[
              { label: "Shop Name", value: SHOP_NAME },
              { label: "Total Tables", value: "5 (Table 1 – 5)" },
              { label: "Currency", value: "INR (₹)" },
              { label: "Payment Modes", value: "Cash, Online" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.03)", borderRadius: "0.75rem", border: "1px solid var(--admin-border)" }}>
                <span style={{ color: "var(--admin-muted)", fontSize: "0.85rem" }}>{label}</span>
                <span style={{ color: "var(--admin-text)", fontWeight: "600", fontSize: "0.9rem" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Auth Info */}
        <div className="admin-card">
          <h2 className="font-display" style={{ color: "var(--admin-text)", fontSize: "1.1rem", fontWeight: "700", marginBottom: "1.25rem" }}>
            🔐 Admin Access
          </h2>
          <div style={{ display: "grid", gap: "0.875rem" }}>
            {[
              { label: "Admin Password", value: "admin123" },
              { label: "Auth Storage", value: "Browser localStorage" },
              { label: "Session", value: "Persistent until logout" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.03)", borderRadius: "0.75rem", border: "1px solid var(--admin-border)" }}>
                <span style={{ color: "var(--admin-muted)", fontSize: "0.85rem" }}>{label}</span>
                <span style={{ color: "var(--amber-light)", fontWeight: "600", fontSize: "0.88rem" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="admin-card">
          <h2 className="font-display" style={{ color: "var(--admin-text)", fontSize: "1.1rem", fontWeight: "700", marginBottom: "1.25rem" }}>
            ⚙️ Tech Stack
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {["React 19", "Vite", "Tailwind CSS v4", "Node.js", "Express", "MongoDB", "Mongoose", "Axios"].map((tech) => (
              <span key={tech} style={{ background: "rgba(217,119,6,0.1)", border: "1px solid rgba(217,119,6,0.2)", color: "#d97706", padding: "0.3rem 0.75rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "600" }}>
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* API Info */}
        <div className="admin-card">
          <h2 className="font-display" style={{ color: "var(--admin-text)", fontSize: "1.1rem", fontWeight: "700", marginBottom: "1.25rem" }}>
            🔌 API Endpoints
          </h2>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {[
              "POST /api/orders",
              "GET /api/orders",
              "PATCH /api/orders/:id/status",
              "GET /api/reports/summary",
              "GET /api/billing",
              "GET /api/tables",
            ].map((ep) => (
              <div key={ep} style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#34d399", background: "rgba(16,185,129,0.06)", padding: "0.5rem 0.875rem", borderRadius: "0.5rem", border: "1px solid rgba(16,185,129,0.15)" }}>
                {ep}
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="admin-card" style={{ border: "1px solid rgba(239,68,68,0.3)" }}>
          <h2 className="font-display" style={{ color: "#ef4444", fontSize: "1.1rem", fontWeight: "700", marginBottom: "1.25rem" }}>
            ⚠️ Danger Zone
          </h2>
          <p style={{ color: "var(--admin-muted)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
            Wiping the order database will permanently delete all order history, invoices, and reports. Menu items will not be affected.
          </p>
          <button
            onClick={handleWipeOrders}
            disabled={wiping}
            style={{ width: "100%", padding: "0.875rem", borderRadius: "0.75rem", border: "none", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "0.95rem", fontWeight: "700", cursor: wiping ? "not-allowed" : "pointer", transition: "all 0.2s" }}
          >
            {wiping ? "Wiping Database..." : "🗑 Reset All Orders to 0"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;