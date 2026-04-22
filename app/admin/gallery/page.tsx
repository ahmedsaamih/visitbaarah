"use client";

import MediaManager from "@/components/admin/MediaManager";

export default function AdminGallery() {
  return (
    <div>
      <div className="title-row">
        <h1>Gallery Management</h1>
      </div>

      <div className="card">
        <p style={{ marginBottom: "24px", color: "var(--admin-text-light)" }}>
          Manage the public "Island Memories" gallery. Images uploaded here will appear in the staggered gallery reel on the homepage.
        </p>
        
        <MediaManager 
          entityType="gallery" 
          entityId={0} 
        />
      </div>
    </div>
  );
}
