import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../utils/formatCurrency";
import toast from "react-hot-toast";

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems, selectedTable, increaseQuantity, decreaseQuantity,
    removeFromCart, getCartTotal,
  } = useCart();

  const handleRemove = (item) => {
    removeFromCart(item.id);
    toast(`${item.name} removed`, { icon: "🗑" });
  };

  return (
    <div className="bg-customer transition-colors" style={{ minHeight: "100vh", padding: "1.5rem" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.75rem" }}>
          <button
            onClick={() => navigate(`/menu/${selectedTable || 1}`)}
            className="btn-ghost"
            style={{ padding: "0.5rem 0.875rem", fontSize: "0.9rem", cursor: "pointer", fontWeight: "600" }}
          >
            ← Back
          </button>
          <div>
            <h1 className="font-display text-gradient" style={{ fontSize: "2.2rem", fontWeight: "900", letterSpacing: "-0.02em" }}>
              Your Cart
            </h1>
            <p className="text-customer-subtitle" style={{ fontSize: "0.85rem", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase" }}>{String(selectedTable).toLowerCase() === 'parcel' ? '📦 Parcel Order' : `Table ${selectedTable || "—"}`}</p>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="customer-card" style={{ padding: "3rem", textAlign: "center" }}>
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🍫</p>
            <h2 className="text-customer-title" style={{ fontWeight: "700", marginBottom: "0.5rem" }}>Cart is Empty</h2>
            <p className="text-customer-subtitle" style={{ marginBottom: "1.5rem" }}>Add some delicious desserts!</p>
            <button
              onClick={() => navigate(`/menu/${selectedTable || 1}`)}
              className="btn-primary"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {/* Items */}
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="customer-card"
                style={{ padding: "1.1rem 1.35rem", display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", alignItems: "center" }}
              >
                <div style={{ flex: 1, minWidth: "160px" }}>
                  <p className="text-customer-title" style={{ fontWeight: "700", fontSize: "1rem" }}>{item.name}</p>
                  <p className="text-customer-subtitle" style={{ fontSize: "0.8rem", marginTop: "0.15rem" }}>{item.category}</p>
                  <p style={{ color: "var(--brand-primary)", fontWeight: "700", marginTop: "0.3rem" }}>₹{item.price}</p>
                </div>

                {/* Qty Controls */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1.5px solid var(--customer-card-border)", background: "transparent", color: "var(--brand-primary)", fontWeight: "800", fontSize: "1.1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    −
                  </button>
                  <span className="text-customer-title" style={{ fontWeight: "800", fontSize: "1.1rem", minWidth: "24px", textAlign: "center" }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => increaseQuantity(item.id)}
                    style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", background: "var(--brand-primary)", color: "white", fontWeight: "800", fontSize: "1.1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    +
                  </button>
                </div>

                <div style={{ textAlign: "right" }}>
                  <p className="text-customer-title" style={{ fontWeight: "800", fontSize: "1.1rem" }}>
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => handleRemove(item)}
                    style={{ background: "none", border: "none", color: "#ef4444", fontSize: "0.8rem", cursor: "pointer", marginTop: "0.25rem", fontWeight: "500" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Summary */}
            <div className="customer-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <span className="text-customer-title" style={{ fontWeight: "700", fontSize: "1.1rem" }}>Order Total</span>
                <span style={{ fontWeight: "800", fontSize: "1.5rem", color: "var(--brand-primary)" }}>{formatCurrency(getCartTotal())}</span>
              </div>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <button
                  onClick={() => navigate(`/menu/${selectedTable || 1}`)}
                  className="btn-ghost"
                  style={{ width: "100%" }}
                >
                  + Add More Items
                </button>
                <button
                  onClick={() => navigate("/checkout")}
                  className="btn-primary"
                  style={{ width: "100%" }}
                >
                  Proceed to Checkout →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;