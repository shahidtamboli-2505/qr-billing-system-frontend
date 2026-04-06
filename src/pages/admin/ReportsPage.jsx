import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { supabase } from "../../lib/supabase";
import { formatCurrency } from "../../utils/formatCurrency";
import toast from "react-hot-toast";

const ReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    try {
      const { data: orders, error } = await supabase.from('orders').select('*, items:order_items(*)');
      if (error) throw error;

      const totalOrders = orders.length;
      const totalRevenue = orders.filter(o => o.status === 'Paid' || o.payment_status === 'Online').reduce((sum, o) => sum + Number(o.total), 0);
      const today = new Date().toDateString();
      const todayRevenue = orders.filter(o => new Date(o.created_at).toDateString() === today && (o.status === 'Paid' || o.payment_status === 'Online')).reduce((sum, o) => sum + Number(o.total), 0);

      const pendingOrders = orders.filter(o => o.status === 'Pending').length;
      const preparingOrders = orders.filter(o => o.status === 'Preparing').length;
      const servedOrders = orders.filter(o => o.status === 'Served').length;
      const paidOrders = orders.filter(o => o.status === 'Paid').length;

      const itemCounts = {};
      orders.forEach(o => {
        o.items.forEach(i => {
          itemCounts[i.item_name] = (itemCounts[i.item_name] || 0) + i.quantity;
        });
      });
      let topItem = null;
      let max = 0;
      Object.entries(itemCounts).forEach(([name, count]) => {
        if (count > max) { topItem = { name, count }; max = count; }
      });

      const recentOrders = orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5).map(o => ({
        _id: o.id, tableNumber: o.table_number, totalAmount: o.total, createdAt: o.created_at, items: o.items.map(i => ({ name: i.item_name, quantity: i.quantity, price: i.price }))
      }));

      setData({ totalOrders, totalRevenue, todayRevenue, pendingOrders, preparingOrders, servedOrders, paidOrders, topItem, recentOrders });
    } catch {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
    const interval = setInterval(fetchReport, 30000);
    return () => clearInterval(interval);
  }, [fetchReport]);

  if (loading) {
    return (
      <AdminLayout title="Reports" subtitle="Sales & performance metrics">
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--admin-muted)" }}>
          Loading report data...
        </div>
      </AdminLayout>
    );
  }

  const statusItems = [
    { label: "Pending", value: data?.pendingOrders || 0, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" },
    { label: "Preparing", value: data?.preparingOrders || 0, color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)" },
    { label: "Served", value: data?.servedOrders || 0, color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)" },
    { label: "Paid", value: data?.paidOrders || 0, color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)" },
  ];

  return (
    <AdminLayout title="Reports" subtitle="Sales & performance analytics">
      {/* Main Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <div className="stat-card" style={{ gridColumn: "span 2" }}>
          <p style={{ color: "var(--admin-muted)", fontSize: "0.78rem", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase" }}>Total Revenue</p>
          <p className="font-display" style={{ color: "#10b981", fontSize: "3rem", fontWeight: "800", marginTop: "0.5rem" }}>
            {formatCurrency(data?.totalRevenue || 0)}
          </p>
          <p style={{ color: "var(--admin-muted)", fontSize: "0.85rem", marginTop: "0.4rem" }}>
            Today: <strong style={{ color: "#34d399" }}>{formatCurrency(data?.todayRevenue || 0)}</strong>
          </p>
        </div>

        <div className="stat-card">
          <p style={{ color: "var(--admin-muted)", fontSize: "0.78rem", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase" }}>Total Orders</p>
          <p className="font-display" style={{ color: "#d97706", fontSize: "3rem", fontWeight: "800", marginTop: "0.5rem" }}>
            {data?.totalOrders || 0}
          </p>
        </div>

        <div className="stat-card">
          <p style={{ color: "var(--admin-muted)", fontSize: "0.78rem", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase" }}>🏆 Top Item</p>
          {data?.topItem ? (
            <>
              <p className="font-display" style={{ color: "#fbbf24", fontSize: "1.1rem", fontWeight: "700", marginTop: "0.5rem" }}>
                {data.topItem.name}
              </p>
              <p style={{ color: "var(--admin-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                {data.topItem.count} orders
              </p>
            </>
          ) : (
            <p style={{ color: "var(--admin-muted)", marginTop: "0.5rem" }}>No data yet</p>
          )}
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <h2 className="font-display" style={{ color: "var(--admin-text)", fontSize: "1.2rem", fontWeight: "700", marginBottom: "1.25rem" }}>
          Order Status Breakdown
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
          {statusItems.map((item) => (
            <div
              key={item.label}
              style={{ background: item.bg, border: `1px solid ${item.border}`, borderRadius: "0.875rem", padding: "1.25rem", textAlign: "center" }}
            >
              <p style={{ color: item.color, fontSize: "2rem", fontWeight: "800" }}>{item.value}</p>
              <p style={{ color: item.color, fontSize: "0.82rem", fontWeight: "600", marginTop: "0.25rem" }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      {data?.recentOrders && data.recentOrders.length > 0 && (
        <div className="admin-card">
          <h2 className="font-display" style={{ color: "var(--admin-text)", fontSize: "1.2rem", fontWeight: "700", marginBottom: "1.25rem" }}>
            Recent Orders
          </h2>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {data.recentOrders.map((order) => (
              <div key={order._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.03)", borderRadius: "0.75rem", border: "1px solid var(--admin-border)" }}>
                <div>
                  <span style={{ color: "var(--amber-light)", fontWeight: "600", fontSize: "0.85rem" }}>
                    #{order._id.slice(-6).toUpperCase()}
                  </span>
                  <span style={{ color: "var(--admin-muted)", marginLeft: "0.75rem", fontSize: "0.85rem" }}>
                    {String(order.tableNumber).toLowerCase() === "parcel" ? "Parcel" : `Table ${order.tableNumber}`} · {order.items.length} items
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{ color: "#10b981", fontWeight: "700" }}>{formatCurrency(order.totalAmount)}</span>
                  <span style={{ color: "var(--admin-muted)", fontSize: "0.78rem" }}>
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: "1rem", textAlign: "right" }}>
        <button onClick={fetchReport} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--admin-border)", color: "var(--admin-muted)", padding: "0.5rem 1rem", borderRadius: "0.625rem", fontSize: "0.82rem", cursor: "pointer" }}>
          ↻ Refresh Report
        </button>
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;