"use client";

import { useEffect, useState } from "react";

export default function AdminSettings() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadState, setUploadState] = useState<Record<string, "idle" | "optimizing" | "uploading" | "done">>({
    hero_image_url: "idle",
    about_image_url: "idle",
    dining_image_url: "idle",
  });

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.ok ? await res.json() : [];
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (key: string, value: string) => {
    setItems(items.map(item => item.key === key ? { ...item, value } : item));
  };

  const handleSave = async (item: any) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) alert("Save failed for " + item.key);
    } catch (err) {
      alert("Error saving");
    } finally {
      setSaving(false);
    }
  };

  const getUploadState = (key: string) => uploadState[key] || "idle";

  const setUploadStateFor = (key: string, state: "idle" | "optimizing" | "uploading" | "done") => {
    setUploadState((prev) => ({ ...prev, [key]: state }));
  };

  const handleSettingImageUpload = async (settingKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStateFor(settingKey, "optimizing");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entityType", "settings");
    formData.append("type", "image");

    // Simulate "optimizing" hint before hitting the API
    setTimeout(async () => {
      setUploadStateFor(settingKey, "uploading");
      try {
        const res = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          handleChange(settingKey, data.url);
          await handleSave({ key: settingKey, value: data.url, group: "general" });
          setUploadStateFor(settingKey, "done");
          setTimeout(() => setUploadStateFor(settingKey, "idle"), 2000);
        } else {
          alert("Image upload failed");
          setUploadStateFor(settingKey, "idle");
        }
      } catch (err) {
        alert("Error uploading");
        setUploadStateFor(settingKey, "idle");
      }
    }, 1000);
  };

  const [otpStep, setOtpStep] = useState<"idle" | "verify">("idle");
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");

  const handleSendEmailOtp = async () => {
    if (!newEmail) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, type: "email_change" }),
      });
      if (res.ok) {
        setOtpStep("verify");
      } else {
        alert("Failed to send OTP");
      }
    } catch (err) {
      alert("Error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyEmail = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/auth/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, code: otp }),
      });
      if (res.ok) {
        alert("Recovery email updated!");
        setOtpStep("idle");
        setNewEmail("");
        setOtp("");
        fetchItems();
      } else {
        alert("Verification failed");
      }
    } catch (err) {
      alert("Error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const groups = items.reduce((acc: any, item: any) => {
    const g = item.group || "general";
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  return (
    <div>
      <div className="title-row">
        <h1>Global Settings</h1>
      </div>

      {/* Hero Image Setting */}
      <div className="card">
        <h2 style={{ borderBottom: "1px solid var(--admin-border)", paddingBottom: "12px", marginBottom: "20px" }}>Homepage Visuals</h2>
        <div style={{ display: "flex", gap: "32px", alignItems: "start" }}>
          <div style={{ width: "300px", aspectRatio: "16/9", borderRadius: "12px", overflow: "hidden", background: "#000", flexShrink: 0 }}>
            <img 
              src={items.find(i => i.key === "hero_image_url")?.value || "/images/hero.png"} 
              alt="Hero Preview" 
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div>
            <label className="btn btn-primary" style={{ cursor: "pointer" }}>
              {getUploadState("hero_image_url") === "idle" ? "Change Hero Image" : 
               getUploadState("hero_image_url") === "optimizing" ? "Optimizing..." : 
               getUploadState("hero_image_url") === "uploading" ? "Uploading..." : "Done ✓"}
              <input type="file" onChange={(e) => handleSettingImageUpload("hero_image_url", e)} style={{ display: "none" }} accept="image/*" disabled={getUploadState("hero_image_url") !== "idle"} />
            </label>
            <p style={{ marginTop: "12px", fontSize: "13px", color: "var(--admin-text-light)" }}>
              Optimization hint: Images are automatically compressed to WebP/JPEG for fast loading.
            </p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginTop: "24px" }}>
          {[
            { key: "about_image_url", label: "Our Story Image" },
            { key: "dining_image_url", label: "Culinary Delights Image" },
          ].map((imageSetting) => (
            <div key={imageSetting.key} style={{ border: "1px solid var(--admin-border)", borderRadius: "10px", padding: "14px" }}>
              <div style={{ fontWeight: 600, marginBottom: "10px" }}>{imageSetting.label}</div>
              <div style={{ width: "100%", aspectRatio: "16/10", borderRadius: "10px", overflow: "hidden", background: "#0f172a", marginBottom: "10px" }}>
                <img
                  src={items.find(i => i.key === imageSetting.key)?.value || "/images/hero.png"}
                  alt={imageSetting.label}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <label className="btn btn-outline" style={{ cursor: "pointer", width: "100%", textAlign: "center" }}>
                {getUploadState(imageSetting.key) === "idle" ? "Upload" :
                  getUploadState(imageSetting.key) === "optimizing" ? "Optimizing..." :
                  getUploadState(imageSetting.key) === "uploading" ? "Uploading..." : "Done ✓"}
                <input
                  type="file"
                  onChange={(e) => handleSettingImageUpload(imageSetting.key, e)}
                  style={{ display: "none" }}
                  accept="image/*"
                  disabled={getUploadState(imageSetting.key) !== "idle"}
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Security Section */}
      <div className="card">
        <h2 style={{ borderBottom: "1px solid var(--admin-border)", paddingBottom: "12px", marginBottom: "20px" }}>Security & Recovery</h2>
        <div className="form-group">
          <label>Admin Recovery Email</label>
          <div style={{ display: "flex", gap: "12px" }}>
            <input 
              type="text" 
              value={items.find(i => i.key === "admin_recovery_email")?.value || "Not set"} 
              readOnly 
              style={{ background: "#f1f5f9" }}
            />
            <button onClick={() => setOtpStep("verify")} className="btn btn-outline">Change</button>
          </div>
        </div>

        {otpStep === "verify" && (
          <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "8px", marginTop: "16px" }}>
            <h3>Change Recovery Email</h3>
            <div className="form-group" style={{ marginTop: "16px" }}>
              <label>New Email Address</label>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="new@example.com" />
            </div>
            <button onClick={handleSendEmailOtp} className="btn btn-primary" disabled={saving}>Send OTP to New Email</button>
            
            <div className="form-group" style={{ marginTop: "20px" }}>
              <label>Verification Code (OTP)</label>
              <input type="text" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456" />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={handleVerifyEmail} className="btn btn-primary" disabled={saving}>Verify & Update</button>
              <button onClick={() => setOtpStep("idle")} className="btn btn-outline">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Rest of Settings */}
      {Object.keys(groups).filter(g => g !== "security").sort().map((groupName) => (
        <div key={groupName} className="card">
          <h2 style={{ textTransform: "capitalize", borderBottom: "1px solid var(--admin-border)", paddingBottom: "12px", marginBottom: "20px" }}>
            {groupName} Settings
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
            {groups[groupName].map((item: any) => (
              <div key={item.key} className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ textTransform: "capitalize" }}>{item.key.replace(/_/g, " ")}</label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <input type="text" value={item.value} onChange={e => handleChange(item.key, e.target.value)} />
                  <button onClick={() => handleSave(item)} className="btn btn-outline" disabled={saving}>Save</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
