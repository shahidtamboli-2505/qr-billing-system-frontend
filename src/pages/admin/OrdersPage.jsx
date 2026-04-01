import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { supabase } from "../../lib/supabase";
import { formatCurrency } from "../../utils/formatCurrency";
import api from "../../services/api";
import toast from "react-hot-toast";

const statusFlow = {
  Pending: { next: "Preparing", label: "Mark Preparing", color: "#3b82f6" },
  Preparing: { next: "Served", label: "Mark Served", color: "#22c55e" },
  Served: { next: "Paid", label: "Mark Paid", color: "#10b981" },
  Paid: null,
};

const statusColors = {
  Pending: "badge-pending",
  Preparing: "badge-preparing",
  Served: "badge-served",
  Paid: "badge-paid",
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editTable, setEditTable] = useState("");
  const [editWhatsApp, setEditWhatsApp] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false });
      if (error) throw error;
      const formatted = (data || []).map(o => ({
        ...o,
        _id: o.id,
        tableNumber: o.table_number,
        customerWhatsApp: o.customer_phone,
        orderStatus: o.status,
        totalAmount: o.total,
        paymentMode: o.payment_status,
        createdAt: o.created_at,
        items: o.items.map(i => ({ name: i.item_name, quantity: i.quantity, price: i.price }))
      }));
      setOrders(formatted);
    } catch {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      toast.success(`Order marked as ${newStatus}!`);
      if (newStatus === "Paid") toast.success("Click '📱 Send Bill' to WhatsApp the invoice!", { icon: '📲', duration: 4000 });
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) throw error;
      toast.success("Order deleted");
      fetchOrders();
    } catch {
      toast.error("Failed to delete order");
    }
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    setEditTable(order.tableNumber);
    setEditWhatsApp(order.customerWhatsApp);
  };

  // NEW: Dedicated function for WhatsApp sending (100% popup-blocker proof)
  const handleSendWhatsApp = async (order) => {
    if (!order.customerWhatsApp || order.customerWhatsApp.length < 10) {
      toast.error("Valid WhatsApp number required!");
      return;
    }
    const toastId = toast.loading("Sending invoice via backend...");
    try {
      await api.post("/send-whatsapp", { orderId: order._id });
      toast.success("Invoice sent successfully! ✅", { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.message || "Backend failed to send invoice.", { id: toastId });
    }
  };

  const handleSaveEdit = async () => {
    if (!editTable || !editWhatsApp.trim() || editWhatsApp.length < 10) {
      toast.error("Valid table and WhatsApp (10+ digits) required");
      return;
    }

    try {
      const { error } = await supabase.from('orders').update({
        table_number: editTable,
        customer_phone: editWhatsApp
      }).eq('id', editingOrder._id);
      if (error) throw error;
      toast.success("Order details updated successfully! ✅");
      fetchOrders(); // Update hone ke baad list refresh karna zaroori hai
      setEditingOrder(null);
    } catch (error) {
      console.error("Edit Order Error:", error);
      toast.error(error?.response?.data?.message || "Failed to save order details.");
    }
  };

  const filters = ["All", "Pending", "Preparing", "Served", "Paid"];
  const filtered = filter === "All" ? orders : orders.filter((o) => o.orderStatus === filter);

  return (
    <AdminLayout
      title="Orders"
      subtitle={`${orders.length} total orders · Auto-refreshes every 30s`}
    >
      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "0.5rem 1.1rem",
              borderRadius: "999px",
              border: filter === f ? "1px solid rgba(217,119,6,0.4)" : "1px solid var(--admin-border)",
              background: filter === f ? "rgba(217,119,6,0.15)" : "rgba(255,255,255,0.03)",
              color: filter === f ? "#fbbf24" : "var(--admin-muted)",
              fontSize: "0.85rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {f} {f !== "All" ? `(${orders.filter((o) => o.orderStatus === f).length})` : `(${orders.length})`}
          </button>
        ))}
        <button
          onClick={fetchOrders}
          style={{ marginLeft: "auto", padding: "0.5rem 1rem", borderRadius: "0.625rem", border: "1px solid var(--admin-border)", background: "rgba(255,255,255,0.04)", color: "var(--admin-muted)", fontSize: "0.82rem", cursor: "pointer" }}
        >
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--admin-muted)" }}>Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div className="admin-card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🍫</p>
          <p style={{ color: "var(--admin-muted)" }}>No {filter !== "All" ? filter : ""} orders found</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
          {filtered.map((order) => {
            const next = statusFlow[order.orderStatus];
            return (
              <div
                key={order._id}
                className="admin-card-hover"
                style={{
                  background: "rgba(36,22,8,0.4)",
                  border: "1px solid var(--admin-border)",
                  borderTop: `4px solid ${next ? next.color : "#10b981"}`,
                  borderRadius: "1rem",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem"
                }}
              >
                {/* Header Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ color: "var(--amber-light)", fontWeight: "800", fontSize: "0.95rem", letterSpacing: "0.05em" }}>
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span className={`badge ${statusColors[order.orderStatus]}`} style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <span style={{ color: "var(--admin-muted)", fontSize: "0.75rem", fontWeight: "500" }}>
                    {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {/* Customer & Table Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "0.5rem" }}>
                    <p style={{ color: "var(--admin-muted)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.2rem" }}>Table</p>
                    <p style={{ color: "var(--admin-text)", fontSize: "1.1rem", fontWeight: "700" }}>No. {order.tableNumber}</p>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "0.5rem" }}>
                    <p style={{ color: "var(--admin-muted)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.2rem" }}>Customer</p>
                    <p style={{ color: "var(--admin-text)", fontSize: "0.9rem", fontWeight: "600" }}>{order.customerWhatsApp}</p>
                  </div>
                </div>

                {/* Items List */}
                <div style={{ padding: "0.5rem 0" }}>
                  <p style={{ color: "var(--admin-muted)", fontSize: "0.75rem", marginBottom: "0.4rem", fontWeight: "600" }}>ORDER ITEMS:</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                        <span style={{ color: "#d4b896" }}>{item.quantity}x {item.name}</span>
                        <span style={{ color: "var(--admin-muted)" }}>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total & Payment Mode */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px dashed rgba(255,255,255,0.08)", paddingTop: "1rem" }}>
                  <div>
                    <p style={{ color: "var(--admin-muted)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Payment</p>
                    <p style={{ color: "var(--admin-text)", fontSize: "0.85rem", fontWeight: "600", marginTop: "0.2rem" }}>{order.paymentMode}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ color: "var(--admin-muted)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Amount</p>
                    <p style={{ color: "#10b981", fontSize: "1.4rem", fontWeight: "800", lineHeight: "1" }}>
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.5rem" }}>
                  {next && (
                    <button
                      disabled={updatingId === order._id}
                      onClick={() => handleStatusUpdate(order._id, next.next)}
                      style={{
                        gridColumn: "span 2",
                        padding: "0.75rem",
                        borderRadius: "0.5rem",
                        border: "none",
                        background: next.color,
                        color: "white",
                        fontWeight: "700",
                        fontSize: "0.9rem",
                        cursor: "pointer",
                        opacity: updatingId === order._id ? 0.7 : 1,
                        transition: "all 0.2s",
                        boxShadow: `0 4px 12px ${next.color}33`
                      }}
                    >
                      {updatingId === order._id ? "Updating..." : next.label}
                    </button>
                  )}
                  {order.orderStatus === "Paid" && (
                    <button
                      onClick={() => handleSendWhatsApp(order)}
                      style={{ gridColumn: "span 2", padding: "0.75rem", borderRadius: "0.5rem", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", color: "#4ade80", fontSize: "0.9rem", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }}
                    >
                      📲 Send WhatsApp Bill
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(order)}
                    style={{ padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.1)", color: "#60a5fa", fontSize: "0.8rem", cursor: "pointer", fontWeight: "600" }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(order._id)}
                    style={{ padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)", color: "#f87171", fontSize: "0.8rem", cursor: "pointer", fontWeight: "600" }}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1.5rem" }}>
          <div className="admin-card" style={{ maxWidth: "500px", width: "100%", padding: "2rem", position: "relative" }}>
            <button
              onClick={() => setEditingOrder(null)}
              style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "none", border: "none", color: "var(--admin-muted)", fontSize: "1.5rem", cursor: "pointer" }}
            >
              ✕
            </button>

            <h2 className="font-display" style={{ color: "var(--admin-text)", fontSize: "1.3rem", fontWeight: "700", marginBottom: "1.5rem" }}>
              Edit Order #{editingOrder._id.slice(-6).toUpperCase()}
            </h2>

            <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ display: "block", color: "var(--admin-muted)", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                  Table Number
                </label>
                <input
                  type="number"
                  value={editTable}
                  onChange={(e) => setEditTable(Number(e.target.value))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "0.625rem", border: "1px solid var(--admin-border)", background: "rgba(255,255,255,0.03)", color: "var(--admin-text)", fontSize: "0.9rem", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", color: "var(--admin-muted)", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                  Customer WhatsApp
                </label>
                <input
                  type="tel"
                  value={editWhatsApp}
                  onChange={(e) => setEditWhatsApp(e.target.value)}
                  placeholder="10+ digit WhatsApp number"
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "0.625rem", border: "1px solid var(--admin-border)", background: "rgba(255,255,255,0.03)", color: "var(--admin-text)", fontSize: "0.9rem", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={handleSaveEdit}
                style={{ flex: 1, padding: "0.75rem", borderRadius: "0.625rem", border: "none", background: "#10b981", color: "white", fontWeight: "600", cursor: "pointer" }}
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingOrder(null)}
                style={{ flex: 1, padding: "0.75rem", borderRadius: "0.625rem", border: "1px solid var(--admin-border)", background: "rgba(255,255,255,0.03)", color: "var(--admin-muted)", fontWeight: "600", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default OrdersPage;