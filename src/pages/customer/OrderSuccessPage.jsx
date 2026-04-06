import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const { selectedTable, customerWhatsApp, orderId } = useCart();

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #fdf8f0 0%, #f7ece0 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ maxWidth: "480px", width: "100%" }} className="animate-fade-in">
        <div className="glass-card" style={{ padding: "2.5rem", textAlign: "center" }}>
          {/* Success Animation */}
          <div style={{ fontSize: "4rem", marginBottom: "1rem", animation: "fadeIn 0.5s ease" }}>🎉</div>
          <h1 className="font-display" style={{ fontSize: "2rem", fontWeight: "800", color: "#3b1f0e", marginBottom: "0.5rem" }}>
            Order Placed!
          </h1>
          <p style={{ color: "#7a5c4d", marginBottom: "1.75rem" }}>
            Your order is being prepared. We'll serve you shortly!
          </p>

          {/* Order Details */}
          <div style={{ background: "rgba(111,78,55,0.06)", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1.75rem", border: "1px solid rgba(111,78,55,0.12)", textAlign: "left" }}>
            {[
              { label: "Order Type", value: String(selectedTable).toLowerCase() === 'parcel' ? "📦 Parcel" : `Table ${selectedTable}` },
              { label: "WhatsApp", value: customerWhatsApp },
              { label: "Order ID", value: orderId ? `#${orderId.slice(-8).toUpperCase()}` : "—" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                <span style={{ color: "#9b7b60" }}>{label}</span>
                <span style={{ fontWeight: "700", color: "#4b2e2b" }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gap: "0.75rem" }}>
            {orderId && (
              <button
                onClick={() => navigate(`/invoice/${orderId}`)}
                className="btn-primary"
                style={{ width: "100%" }}
              >
                🧾 View Invoice
              </button>
            )}
            <button
              onClick={() => navigate(`/menu/${selectedTable || 1}`)}
              className="btn-ghost"
              style={{ width: "100%" }}
            >
              ← Back to Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;