import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { supabase } from "../../lib/supabase";
import api from "../../services/api";
import { formatCurrency, roundCurrency } from "../../utils/formatCurrency";
import toast from "react-hot-toast";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, selectedTable, getCartTotal, setCustomerWhatsApp, setOrderId, clearCart } = useCart();

  const [whatsapp, setWhatsapp] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [loading, setLoading] = useState(false);

  const processOrderToBackend = async () => {
    setLoading(true);
    try {
      const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
        table_number: String(selectedTable),
        customer_phone: whatsapp.trim(),
        status: 'Pending',
        total: getCartTotal(),
        payment_status: paymentMode
      }]).select().single();

      if (orderError) throw orderError;
      const newOrderId = orderData.id;

      const orderItems = cartItems.map(item => ({
        order_id: newOrderId,
        menu_item_id: item.id,
        item_name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      setCustomerWhatsApp(whatsapp.trim());
      setOrderId(newOrderId);
      clearCart();

      toast.success("Order placed successfully! 🎉");
      navigate("/success");
    } catch (err) {
      toast.error("Failed to place order. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!whatsapp.trim() || whatsapp.length < 10) {
      toast.error("Please enter a valid WhatsApp number");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    processOrderToBackend();
  };

  return (
    <div className="bg-customer transition-colors" style={{ minHeight: "100vh", padding: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: "520px", width: "100%", position: "relative", zIndex: 10 }} className="animate-fade-in">
        <button
          onClick={() => navigate("/cart")}
          className="btn-ghost"
          style={{ padding: "0.5rem 0.875rem", fontSize: "0.9rem", cursor: "pointer", fontWeight: "600", marginBottom: "1.5rem" }}
        >
          ← Back to Cart
        </button>

        <div className="customer-card" style={{ padding: "2.25rem" }}>
          <h1 className="font-display text-customer-title" style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.35rem" }}>
            Checkout 💳
          </h1>
          <p className="text-customer-subtitle" style={{ fontSize: "0.88rem", marginBottom: "2rem" }}>
            Table {selectedTable} · {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
          </p>

          <form onSubmit={handleCheckout}>
            {/* WhatsApp */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label className="text-customer-title" style={{ display: "block", fontWeight: "600", fontSize: "0.88rem", marginBottom: "0.5rem" }}>
                WhatsApp Number *
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. 9876543210"
                required
                className="input-field"
              />
            </div>

            {/* Payment Mode */}
            <div style={{ marginBottom: "1.75rem" }}>
              <label className="text-customer-title" style={{ display: "block", fontWeight: "600", fontSize: "0.88rem", marginBottom: "0.75rem" }}>
                Payment Mode
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {["Cash", "Online"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    style={{
                      padding: "0.875rem",
                      borderRadius: "0.875rem",
                      border: paymentMode === mode ? "2px solid var(--brand-primary)" : "1.5px solid var(--customer-card-border)",
                      background: paymentMode === mode ? "rgba(111,78,55,0.08)" : "transparent",
                      color: paymentMode === mode ? "var(--brand-primary)" : "var(--customer-subtitle)",
                      fontWeight: "700",
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {mode === "Cash" ? "💵" : "📲"} {mode === "Cash" ? "Pay at Counter" : "UPI / Card"}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div style={{ background: "rgba(111,78,55,0.06)", borderRadius: "1rem", padding: "1rem 1.25rem", marginBottom: "1.5rem", border: "1px solid var(--customer-card-border)" }}>
              <p className="text-customer-title" style={{ fontWeight: "700", marginBottom: "0.75rem", fontSize: "0.9rem" }}>Order Summary</p>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem", fontSize: "0.85rem" }}>
                  <span className="text-customer-subtitle">{item.name} ×{item.quantity}</span>
                  <span className="text-customer-title" style={{ fontWeight: "600" }}>
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid var(--customer-card-border)", marginTop: "0.75rem", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between" }}>
                <span className="text-customer-title" style={{ fontWeight: "800", fontSize: "1rem" }}>Total</span>
                <span style={{ fontWeight: "800", color: "var(--brand-primary)", fontSize: "1.2rem" }}>
                  {formatCurrency(getCartTotal())}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: "100%", opacity: loading ? 0.75 : 1, transition: "opacity 0.2s" }}
            >
              {loading ? "Processing..." : paymentMode === "Online" ? "Proceed to Pay" : "✅ Confirm Order"}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default CheckoutPage;