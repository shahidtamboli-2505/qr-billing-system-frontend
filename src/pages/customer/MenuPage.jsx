import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { SHOP_NAME } from "../../utils/constants";
import { supabase } from "../../lib/supabase";
import { formatCurrency } from "../../utils/formatCurrency";
import ThemeToggle from "../../components/customer/ThemeToggle";
import toast from "react-hot-toast";

const MenuPage = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { addToCart, setSelectedTable, getCartCount, getCartTotal, cartItems } = useCart();
  const [activeCategory, setActiveCategory] = useState("All");

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedTable(tableId);

    const fetchMenu = async () => {
      try {
        const { data, error } = await supabase.from('menu_items').select('*');
        if (error) throw error;
        const formatted = (data || []).map(item => ({
          ...item,
          id: item.id,
          image: item.image_url,
          isAvailable: item.available
        }));
        setMenuItems(formatted);
      } catch (err) {
        console.error("Supabase Menu Fetch Error:", err);
        toast.error("Failed to load menu");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [tableId, setSelectedTable]);

  const categories = ["All", ...new Set(menuItems.map((i) => i.category))];
  const filtered = activeCategory === "All" ? menuItems : menuItems.filter((i) => i.category === activeCategory);

  const handleAdd = (item) => {
    addToCart(item);
    toast.success(`${item.name} added! ✨`, {
      duration: 1500,
      style: { background: 'rgba(217,119,6,0.9)', color: '#000', backdropFilter: 'blur(10px)', fontWeight: 700 }
    });
  };

  const getQuantityInCart = (id) => {
    const found = cartItems.find(i => i.id === id);
    return found ? found.quantity : 0;
  };

  const cartCount = getCartCount();

  return (
    <div className="bg-customer transition-colors" style={{ minHeight: "100vh", paddingBottom: "100px" }}>
      <ThemeToggle />

      {/* Dynamic Background Geometry */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "10%", right: "-5%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, var(--glow) 0%, transparent 60%)", filter: "blur(50px)" }} />
      </div>

      {/* Ultra-Premium iOS Style Sticky Header */}
      <div className="bg-customer-header" style={{ position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{ width: "42px", height: "42px", objectFit: "contain", filter: "drop-shadow(0 4px 10px var(--glow))" }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div>
            <h1 className="font-display text-gradient" style={{ fontSize: "1.45rem", fontWeight: "900", lineHeight: "1.1", letterSpacing: "-0.02em" }}>
              {SHOP_NAME}
            </h1>
            <p style={{ color: "var(--brand-primary)", fontSize: "0.8rem", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {String(tableId).toLowerCase() === 'parcel' ? '📦 Parcel Order' : `Table ${tableId}`}
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem", position: "relative", zIndex: 10 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem" }} className="text-customer-subtitle animate-pulse">
            <div style={{ width: "40px", height: "40px", border: "3px solid var(--brand-primary)", borderTopColor: "transparent", borderRadius: "50%", margin: "0 auto 1rem", animation: "rotateGlow 1s linear infinite" }} />
            Loading culinary experience...
          </div>
        ) : (
          <>
            {/* Minimalist Glass Categories */}
            <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "1rem", marginBottom: "1.5rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: "0.6rem 1.25rem",
                    borderRadius: "100px",
                    border: activeCategory === cat ? "1.5px solid var(--brand-primary)" : "1.5px solid var(--customer-card-border)",
                    background: activeCategory === cat ? "var(--brand-primary)" : "rgba(255,255,255,0.03)",
                    color: activeCategory === cat ? "#000" : "var(--customer-text)",
                    fontWeight: activeCategory === cat ? "800" : "600",
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
                    boxShadow: activeCategory === cat ? "0 8px 20px var(--glow)" : "none",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Futuristic Menu Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
              {filtered.map((item, i) => {
                const qty = getQuantityInCart(item.id);
                return (
                  <div key={item.id} className="customer-card animate-item-reveal" style={{ animationDelay: `${i * 0.05}s`, opacity: item.isAvailable ? 1 : 0.5 }}>

                    {/* Cinematic Image Wrapper */}
                    <div style={{ position: "relative", paddingTop: "65%", overflow: "hidden", borderTopLeftRadius: "1.5rem", borderTopRightRadius: "1.5rem" }}>
                      {item.image ? (
                        <div style={{ position: "absolute", inset: 0 }}>
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                            className="hover:scale-110"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--customer-card-bg) 0%, transparent 60%)" }} />
                        </div>
                      ) : (
                        <div style={{ position: "absolute", inset: 0, background: "rgba(217,119,6,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>✨</div>
                      )}

                      <div style={{ position: "absolute", top: "1rem", left: "1rem" }}>
                        <span style={{ backdropFilter: "blur(10px)", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "0.3rem 0.8rem", borderRadius: "100px", fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.05em" }}>
                          {item.category}
                        </span>
                      </div>

                      {!item.isAvailable && (
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ border: "2px solid #ef4444", color: "#ef4444", padding: "0.5rem 1rem", borderRadius: "8px", fontWeight: "800", letterSpacing: "0.1em", transform: "rotate(-10deg)" }}>SOLD OUT</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ padding: "1.25rem", position: "relative" }}>
                      <h3 className="font-display" style={{ fontWeight: "800", fontSize: "1.1rem", marginBottom: "0.3rem", color: "var(--customer-text)" }}>
                        {item.name}
                      </h3>
                      <p style={{ color: "var(--customer-subtitle)", fontSize: "0.85rem", marginBottom: "1.5rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.4" }}>
                        {item.description || "A delectable signature creation."}
                      </p>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "1.2rem", fontWeight: "900", color: "var(--brand-primary)" }}>₹{item.price}</span>
                        <button
                          disabled={!item.isAvailable}
                          onClick={() => handleAdd(item)}
                          className={item.isAvailable ? "btn-primary" : ""}
                          style={!item.isAvailable ? { padding: "0.6rem 1.25rem", borderRadius: "1rem", background: "var(--customer-card-border)", color: "var(--customer-subtitle)", border: "none" } : { padding: "0.6rem 1.25rem", fontSize: "0.9rem" }}
                        >
                          {qty > 0 ? `Added (${qty})` : "+ Add"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "4rem" }} className="text-customer-subtitle animate-fade-in">
                No culinary items found in this category.
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Bottom Cart Bar (iOS App Vibe) */}
      {cartCount > 0 && (
        <div className="floating-bottom-bar animate-fade-in" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.1rem" }}>{cartCount} item{cartCount > 1 ? "s" : ""}</p>
            <p style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "800" }}>{formatCurrency(getCartTotal())}</p>
          </div>
          <button
            onClick={() => navigate("/cart")}
            className="btn-primary"
            style={{ padding: "0.8rem 1.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            Checkout <span style={{ fontSize: "1.2rem" }}>→</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuPage;