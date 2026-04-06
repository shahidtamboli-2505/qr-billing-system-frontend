import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

const DEFAULT_CATEGORIES = ["Desserts", "Chocolate Bowls", "Waffles", "Coffee", "Boba Tea", "Combos", "Cone Cake", "Add Ons"];

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    name: "", category: "Desserts", price: "", description: "", image: ""
  });

  const [saving, setSaving] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  const fetchMenu = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('menu_items').select('*');
      if (error) throw error;
      const formatted = (data || []).map(item => ({
        ...item,
        _id: item.id,
        image: item.image_url,
        isAvailable: item.available
      }));
      setMenuItems(formatted);
    } catch {
      toast.error("Failed to fetch menu items");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleOpenModal = (item = null) => {
    if (item && item._id) {
      setEditingItem(item);
      setFormData({
        name: item.name || "",
        category: item.category || "Desserts",
        price: item.price !== undefined ? String(item.price) : "",
        description: item.description || "",
        image: item.image || ""
      });
      setCustomCategory("");
    } else {
      setEditingItem(null);
      setFormData({ name: "", category: "Desserts", price: "", description: "", image: "" });
      setCustomCategory("");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const finalCategory = formData.category === "NEW_CUSTOM_ADDED" ? customCategory.trim() : formData.category;

    if (!formData.name || !formData.price || !finalCategory) {
      return toast.error("Name, price, and category are required");
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        category: finalCategory,
        price: Number(formData.price),
        description: formData.description || "",
        image_url: formData.image || "",
        available: true
      };

      if (editingItem && editingItem._id) {
        const { error } = await supabase.from('menu_items').update(payload).eq('id', editingItem._id);
        if (error) throw error;
        toast.success("Item updated! ✏️");
      } else {
        const { error } = await supabase.from('menu_items').insert([payload]);
        if (error) throw error;
        toast.success("New item added! 🎉");
      }
      handleCloseModal();
      fetchMenu();
    } catch (err) {
      toast.error("Failed to save item. Check connection.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) throw error;
      toast.success(`${name} deleted! 🗑`);
      fetchMenu();
    } catch {
      toast.error("Failed to delete item");
    }
  };

  // Safe unique categories
  const activeCategories = [...new Set(menuItems.map(i => i.category || 'Desserts'))];
  const combinedCategories = [...new Set([...DEFAULT_CATEGORIES, ...activeCategories])];

  return (
    <AdminLayout title="Menu Management" subtitle={`${menuItems.length} live items across ${activeCategories.length} categories`}>

      {/* Top Bar Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <button
          onClick={() => handleOpenModal()}
          style={{ background: "#10b981", color: "white", padding: "0.6rem 1.25rem", borderRadius: "0.875rem", border: "none", fontWeight: "700", fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 4px 15px rgba(16,185,129,0.25)" }}
        >
          <span>➕</span> Add New Item
        </button>
        <button onClick={fetchMenu} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--admin-border)", color: "var(--admin-muted)", padding: "0.5rem 1rem", borderRadius: "0.625rem", fontSize: "0.85rem", cursor: "pointer" }}>
          ↻ Refresh List
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--admin-muted)" }}>Loading menu...</div>
      ) : menuItems.length === 0 ? (
        <div className="admin-card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🍽</p>
          <p style={{ color: "var(--admin-muted)" }}>Your menu is empty. Add some items to get started!</p>
        </div>
      ) : (
        activeCategories.map((cat) => {
          const items = menuItems.filter((i) => i.category === cat);
          return (
            <div key={cat} style={{ marginBottom: "2.5rem" }} className="animate-fade-in">
              {/* Category Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", borderBottom: "1px solid var(--admin-border)", paddingBottom: "0.75rem" }}>
                <h2 className="font-display" style={{ color: "var(--admin-text)", fontSize: "1.25rem", fontWeight: "700" }}>
                  {cat}
                </h2>
                <span style={{ background: "rgba(217,119,6,0.12)", border: "1px solid rgba(217,119,6,0.2)", color: "#d97706", borderRadius: "999px", padding: "0.2rem 0.6rem", fontSize: "0.75rem", fontWeight: "600" }}>
                  {items.length} items
                </span>
              </div>

              {/* Items Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                {items.map((item) => (
                  <div key={item._id} className="admin-card admin-card-hover" style={{ display: "flex", gap: "1rem", padding: "1.25rem", position: "relative" }}>

                    {/* Image */}
                    <div style={{ width: "70px", height: "70px", borderRadius: "0.75rem", overflow: "hidden", background: "rgba(0,0,0,0.3)", flexShrink: 0 }}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--admin-muted)", fontSize: "1.5rem" }}>📷</div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "var(--admin-text)", fontWeight: "700", fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.name}
                      </p>
                      <p style={{ color: "var(--admin-muted)", fontSize: "0.78rem", marginTop: "0.2rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {item.description || "No description"}
                      </p>
                      <p style={{ color: "#10b981", fontWeight: "800", fontSize: "1.1rem", marginTop: "0.4rem" }}>
                        ₹{item.price}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flexShrink: 0 }}>
                      <button
                        onClick={() => handleOpenModal(item)}
                        style={{ padding: "0.4rem", borderRadius: "0.5rem", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#3b82f6", cursor: "pointer", transition: "all 0.2s" }}
                        title="Edit Item"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(item._id, item.name)}
                        style={{ padding: "0.4rem", borderRadius: "0.5rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", cursor: "pointer", transition: "all 0.2s" }}
                        title="Delete Item"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Dynamic Add / Edit Modal */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1.5rem" }}>

          <div className="admin-card animate-fade-in" style={{ width: "100%", maxWidth: "500px", padding: "2rem", position: "relative" }}>

            <button
              onClick={handleCloseModal}
              style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", color: "var(--admin-muted)", fontSize: "1.2rem", cursor: "pointer" }}
            >
              ✕
            </button>

            <h2 className="font-display" style={{ color: "var(--admin-text)", fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem" }}>
              {editingItem ? "Edit Menu Item ✏️" : "Add New Item 🍽"}
            </h2>

            <form onSubmit={handleSave} style={{ display: "grid", gap: "1rem" }}>

              {/* Name & Price Row */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", color: "var(--admin-muted)", fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.4rem" }}>Item Name *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field-dark" placeholder="e.g. Classic Waffle" />
                </div>
                <div>
                  <label style={{ display: "block", color: "var(--admin-muted)", fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.4rem" }}>Price (₹) *</label>
                  <input type="number" required min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="input-field-dark" placeholder="99" />
                </div>
              </div>

              {/* Category */}
              <div>
                <label style={{ display: "block", color: "var(--admin-muted)", fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.4rem" }}>Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field-dark"
                  style={{ appearance: "none", marginBottom: formData.category === "NEW_CUSTOM_ADDED" ? "0.5rem" : "0" }}
                >
                  {combinedCategories.map(cat => <option key={cat} value={cat} style={{ background: "var(--admin-bg)", color: "var(--admin-text)" }}>{cat}</option>)}
                  <option value="NEW_CUSTOM_ADDED" style={{ background: "var(--admin-bg)", color: "#d97706", fontWeight: "bold" }}>+ Add New Category</option>
                </select>

                {formData.category === "NEW_CUSTOM_ADDED" && (
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="input-field-dark"
                    placeholder="Enter new category name..."
                  />
                )}
              </div>

              {/* Image URL */}
              <div>
                <label style={{ display: "block", color: "var(--admin-muted)", fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.4rem" }}>Image Link / URL</label>
                <input type="url" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="input-field-dark" placeholder="https://example.com/image.jpg" />
                {formData.image && <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", alignItems: "center" }}><span style={{ fontSize: "0.75rem", color: "var(--admin-muted)" }}>Preview:</span> <img src={formData.image} alt="Preview" style={{ height: "30px", borderRadius: "4px" }} onError={(e) => e.target.style.display = "none"} /></div>}
              </div>

              {/* Description */}
              <div>
                <label style={{ display: "block", color: "var(--admin-muted)", fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.4rem" }}>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field-dark" placeholder="Short and sweet description..." rows={3} style={{ resize: "none" }} />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                style={{
                  marginTop: "0.5rem",
                  width: "100%",
                  padding: "0.875rem",
                  borderRadius: "0.875rem",
                  border: "none",
                  background: saving ? "rgba(16,185,129,0.5)" : "#10b981",
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: "700",
                  cursor: saving ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 15px rgba(16,185,129,0.2)",
                }}
              >
                {saving ? "Saving..." : editingItem ? "Update Item" : "Create Item"}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default MenuManagement;