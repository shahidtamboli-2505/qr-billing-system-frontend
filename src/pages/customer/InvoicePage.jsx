import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { SHOP_NAME } from "../../utils/constants";
import { formatCurrency } from "../../utils/formatCurrency";

const InvoicePage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase.from('orders').select('*, items:order_items(*)').eq('id', orderId).single();
        if (error || !data) throw new Error();
        setOrder({
          ...data,
          _id: data.id,
          tableNumber: data.table_number,
          customerWhatsApp: data.customer_phone,
          orderStatus: data.status,
          paymentMode: data.payment_status,
          totalAmount: data.total,
          createdAt: data.created_at,
          items: data.items.map(i => ({ name: i.item_name, quantity: i.quantity, price: i.price }))
        });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (orderId && orderId !== "demo-order") {
      fetchOrder();
    } else {
      setError(true);
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #fdf8f0 0%, #f7ece0 100%)" }}>
        <p style={{ color: "#9b7b60" }}>Loading invoice...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #fdf8f0 0%, #f7ece0 100%)", padding: "1.5rem" }}>
        <div className="glass-card" style={{ padding: "2.5rem", textAlign: "center", maxWidth: "400px" }}>
          <p style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>😕</p>
          <h2 style={{ color: "#3b1f0e", marginBottom: "0.5rem" }}>Invoice Not Found</h2>
          <p style={{ color: "#9b7b60", marginBottom: "1.5rem" }}>The invoice may not be available yet.</p>
          <button onClick={() => navigate("/")} className="btn-primary">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #fdf8f0 0%, #f7ece0 100%)", padding: "1.5rem", display: "flex", justifyContent: "center" }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; padding: 20px !important; background: white !important; border: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div style={{ maxWidth: "520px", width: "100%" }} className="animate-fade-in">
        <button
          onClick={() => navigate("/")}
          className="no-print"
          style={{ background: "none", border: "1.5px solid rgba(111,78,55,0.25)", borderRadius: "0.75rem", padding: "0.5rem 0.875rem", color: "#6f4e37", fontSize: "0.9rem", cursor: "pointer", fontWeight: "600", marginBottom: "1.5rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
        >
          ← Home
        </button>

        <div className="glass-card print-area" style={{ padding: "2.25rem", background: "#fff", border: "1px solid #e8d5bc" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "1.75rem", paddingBottom: "1.5rem", borderBottom: "1px dashed rgba(111,78,55,0.2)" }}>
            <p style={{ fontSize: "2rem", marginBottom: "0.35rem" }}>🧾</p>
            <h1 className="font-display" style={{ fontSize: "1.5rem", fontWeight: "800", color: "#3b1f0e" }}>Invoice</h1>
            <p style={{ color: "#9b7b60", fontSize: "0.85rem" }}>{SHOP_NAME}</p>
          </div>

          {/* Order Info */}
          <div style={{ display: "grid", gap: "0.5rem", marginBottom: "1.5rem" }}>
            {[
              { label: "Order ID", value: `#${order._id.slice(-8).toUpperCase()}` },
              { label: "WhatsApp", value: order.customerWhatsApp },
              { label: "Payment", value: order.paymentMode },
              { label: "Status", value: order.orderStatus },
              { label: "Date", value: new Date(order.createdAt).toLocaleString("en-IN") },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem" }}>
                <span style={{ color: "#9b7b60" }}>{label}</span>
                <span style={{ fontWeight: "600", color: "#4b2e2b" }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Items */}
          <div style={{ borderTop: "1px dashed rgba(111,78,55,0.2)", borderBottom: "1px dashed rgba(111,78,55,0.2)", padding: "1.25rem 0", marginBottom: "1.25rem" }}>
            <p style={{ fontWeight: "700", color: "#4b2e2b", marginBottom: "0.875rem", fontSize: "0.9rem" }}>Items Ordered</p>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.88rem" }}>
                <div>
                  <span style={{ color: "#4b2e2b", fontWeight: "600" }}>{item.name}</span>
                  <span style={{ color: "#9b7b60", marginLeft: "0.5rem" }}>×{item.quantity}</span>
                </div>
                <span style={{ color: "#4b2e2b", fontWeight: "700" }}>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
            <span style={{ fontWeight: "800", color: "#3b1f0e", fontSize: "1.1rem" }}>TOTAL</span>
            <span style={{ fontWeight: "800", color: "#6f4e37", fontSize: "1.5rem" }}>{formatCurrency(order.totalAmount)}</span>
          </div>

          <p style={{ textAlign: "center", color: "#b8956a", fontSize: "0.82rem" }}>
            Thank you for visiting Belgian Bliss! 🧇🍫
          </p>

          <button
            onClick={() => window.print()}
            className="btn-primary no-print"
            style={{ width: "100%", marginTop: "2rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
            ⬇️ Download as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;