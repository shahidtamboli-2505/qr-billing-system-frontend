import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SHOP_NAME, TABLES } from "../../utils/constants";
import ThemeToggle from "../../components/customer/ThemeToggle";
import toast from "react-hot-toast";

const HomePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    // Auto-fill agar customer pehle login kar chuka hai
    const savedName = localStorage.getItem("customerName");
    const savedPhone = localStorage.getItem("customerWhatsApp");
    if (savedName) setName(savedName);
    if (savedPhone) setWhatsapp(savedPhone);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter your name");
    if (!whatsapp.trim() || whatsapp.length < 10) return toast.error("Please enter a valid 10-digit WhatsApp number");

    // Save to local storage so cart/checkout can use it later
    localStorage.setItem("customerName", name);
    localStorage.setItem("customerWhatsApp", whatsapp);
    setStep(2);
    toast.success(`Welcome, ${name}! ✨`);
  };

  return (
    <div className="bg-customer transition-colors" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <ThemeToggle />

      {/* Dynamic Background Geometry */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-10%", right: "-10%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, var(--glow) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(217,119,6,0.15) 0%, transparent 70%)", filter: "blur(40px)" }} />
      </div>

      <div style={{ maxWidth: "850px", width: "100%", position: "relative", zIndex: 10 }} className="animate-fade-in">

        {/* Luxury Hero */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
            <div style={{ position: "relative" }}>
              {/* Pulsing Backglow */}
              <div style={{ position: "absolute", inset: 0, background: "var(--brand-primary)", filter: "blur(30px)", opacity: 0.15, borderRadius: "50%", animation: "pulseSubtle 3s infinite" }} />
              <img
                src="/logo.png"
                alt={SHOP_NAME}
                style={{ width: "140px", height: "140px", objectFit: "contain", filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.5))", position: "relative" }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{ display: "none", fontSize: "4.5rem", filter: "drop-shadow(0 10px 20px var(--glow))" }}>🧇✨</div>
            </div>
          </div>

          <h1
            className="font-display text-gradient"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: "900", lineHeight: "1.1", marginBottom: "1rem", letterSpacing: "-0.02em" }}
          >
            {SHOP_NAME}
          </h1>
          <p className="text-customer-subtitle" style={{ fontSize: "1.1rem", maxWidth: "480px", margin: "0 auto", fontWeight: "500", letterSpacing: "0.02em" }}>
            {step === 1 ? "Please login to view our digital menu." : "Select your table below to access the menu."}
          </p>
        </div>

        {step === 1 ? (
          /* STEP 1: CUSTOMER LOGIN FORM */
          <div className="customer-card shadow-premium animate-item-reveal" style={{ padding: "2.5rem", maxWidth: "450px", margin: "0 auto", marginBottom: "2rem" }}>
            <h2 className="font-display text-customer-title" style={{ fontSize: "1.4rem", fontWeight: "800", marginBottom: "1.5rem", textAlign: "center" }}>
              Guest Login
            </h2>
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem", color: "var(--customer-subtitle)" }}>Your Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul" required style={{ width: "100%", padding: "0.875rem", borderRadius: "0.75rem", border: "1px solid var(--customer-card-border)", background: "rgba(255,255,255,0.03)", color: "var(--customer-text)", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem", color: "var(--customer-subtitle)" }}>WhatsApp Number</label>
                <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="e.g. 9876543210" required style={{ width: "100%", padding: "0.875rem", borderRadius: "0.75rem", border: "1px solid var(--customer-card-border)", background: "rgba(255,255,255,0.03)", color: "var(--customer-text)", outline: "none", boxSizing: "border-box" }} />
              </div>
              <button type="submit" style={{ marginTop: "0.5rem", padding: "1rem", borderRadius: "0.875rem", border: "none", background: "var(--brand-primary)", color: "#000", fontSize: "1rem", fontWeight: "700", cursor: "pointer", boxShadow: "0 8px 20px var(--glow)", transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                Continue ➔
              </button>
            </form>

            {/* Tiny Admin Link only on Login Page */}
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <button onClick={() => navigate("/admin/login")} style={{ background: "none", border: "none", color: "var(--customer-subtitle)", fontSize: "0.75rem", opacity: 0.6, cursor: "pointer", textDecoration: "underline" }}>
                Staff / Admin Portal
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: TABLE SELECTION */
          <div className="customer-card shadow-premium animate-item-reveal" style={{ padding: "2.5rem", marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--glow)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)" }}>🪑</div>
                <h2 className="font-display text-customer-title" style={{ fontSize: "1.4rem", fontWeight: "800" }}>
                  Select Table / Parcel
                </h2>
              </div>
              <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "var(--customer-subtitle)", fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline" }}>
                Not {name}?
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "1rem" }}>
              {TABLES.map((table, i) => (
                <button
                  key={table}
                  onClick={() => navigate(`/menu/${table}`)}
                  className="table-btn animate-item-reveal"
                  style={{
                    padding: "1.25rem",
                    borderRadius: "1.125rem",
                    border: "1.5px solid var(--customer-card-border)",
                    background: "rgba(255,255,255,0.02)",
                    color: "var(--customer-text)",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
                    textAlign: "center",
                    animationDelay: `${i * 0.05}s`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
                    e.currentTarget.style.background = "var(--brand-primary)";
                    e.currentTarget.style.color = "#000";
                    e.currentTarget.style.boxShadow = "0 15px 30px var(--glow)";
                    e.currentTarget.style.borderColor = "var(--brand-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                    e.currentTarget.style.color = "var(--customer-text)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = "var(--customer-card-border)";
                  }}
                >
                  <span style={{ fontSize: "1.75rem", display: "block", marginBottom: "0.4rem" }}>🍽</span>
                  <span style={{ fontWeight: "700", fontSize: "1.05rem", letterSpacing: "0.05em" }}>Table {table}</span>
                </button>
              ))}

              {/* Parcel Option */}
              <button
                onClick={() => navigate(`/menu/Parcel`)}
                className="table-btn animate-item-reveal"
                style={{
                  padding: "1.25rem",
                  borderRadius: "1.125rem",
                  border: "1.5px solid var(--brand-primary)",
                  background: "rgba(217,119,6,0.05)",
                  color: "var(--brand-primary)",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
                  textAlign: "center",
                  gridColumn: "1 / -1" // Spans the full width
                }}
              >
                <span style={{ fontSize: "1.75rem", display: "block", marginBottom: "0.4rem" }}>📦</span>
                <span style={{ fontWeight: "700", fontSize: "1.05rem", letterSpacing: "0.05em" }}>Takeaway / Parcel</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;