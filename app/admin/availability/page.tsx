"use client";

import { useEffect, useState } from "react";

export default function AdminAvailability() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/rooms");
      const data = await res.json();
      setRooms(data);
      if (data.length > 0) setSelectedRoomId(data[0].id.toString());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    if (!selectedRoomId) return;
    
    // Fetch for the current month
    const start = formatLocalDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    const end = formatLocalDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));
    
    try {
      const res = await fetch(`/api/admin/availability?roomId=${selectedRoomId}&startDate=${start}&endDate=${end}`);
      const data = await res.json();
      setAvailability(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [selectedRoomId, currentDate]);

  const toggleDate = async (dateStr: string, isCurrentlyBlocked: boolean) => {
    try {
      await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: parseInt(selectedRoomId),
          dates: [dateStr],
          isBlocked: !isCurrentlyBlocked,
          reason: "Admin Override"
        }),
      });
      fetchAvailability();
    } catch (err) {
      alert("Update failed");
    }
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="title-row">
        <h1>Room Availability</h1>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <select value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)} className="btn btn-outline">
            {rooms.map(room => (
              <option key={room.id} value={room.id}>Room {room.roomNumber} ({room.roomType?.name ?? "Unknown type"})</option>
            ))}
          </select>
          <button
            onClick={() =>
              setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
            }
            className="btn btn-outline"
          >
            &lt;
          </button>
          <div style={{ display: "flex", alignItems: "center", padding: "0 12px", fontWeight: "600" }}>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
          <button
            onClick={() =>
              setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
            }
            className="btn btn-outline"
          >
            &gt;
          </button>
        </div>
      </div>

      <div className="card">
        <div
          className="availability-grid"
          style={{ 
          maxWidth: "1020px",
          margin: "0 auto",
          display: "grid", 
          gridTemplateColumns: "repeat(7, 1fr)", 
          gap: "6px",
          textAlign: "center"
        }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div
              className="availability-weekday"
              key={d}
              style={{
                fontWeight: "600",
                fontSize: "12px",
                color: "var(--admin-text-light)",
                paddingBottom: "6px",
                letterSpacing: "0.2px",
              }}
            >
              {d}
            </div>
          ))}
          {calendarDays.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;
            
            const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const avail = availability.find(a => a.date.startsWith(dateStr));
            const isBlocked = avail?.isBlocked;

            return (
              <div 
                key={day} 
                onClick={() => toggleDate(dateStr, !!isBlocked)}
                className="availability-day"
                style={{
                  minHeight: "64px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  cursor: "pointer",
                  border: "1px solid var(--admin-border)",
                  background: isBlocked ? "#fee2e2" : "#d1fae5",
                  color: isBlocked ? "#991b1b" : "#065f46",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.2s"
                }}
              >
                {day}
                <div className="availability-state" style={{ fontSize: "10px", marginTop: "3px", opacity: 0.9 }}>
                  {isBlocked ? "BLK" : "OPEN"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <p style={{ fontSize: "13px", color: "var(--admin-text-light)", marginTop: "16px" }}>
        * Click on a day to toggle between OPEN and BLOCKED for this room.
      </p>
      <style jsx>{`
        @media (max-width: 1024px) {
          .availability-grid {
            max-width: 920px !important;
            gap: 5px !important;
          }
          .availability-day {
            min-height: 58px !important;
            font-size: 13px !important;
            border-radius: 7px !important;
          }
          .availability-state {
            font-size: 9px !important;
            margin-top: 2px !important;
          }
        }

        @media (max-width: 768px) {
          .availability-grid {
            max-width: 100% !important;
            gap: 3px !important;
          }
          .availability-weekday {
            font-size: 10px !important;
            padding-bottom: 4px !important;
          }
          .availability-day {
            min-height: 44px !important;
            font-size: 11px !important;
            border-radius: 6px !important;
          }
          .availability-state {
            font-size: 8px !important;
            margin-top: 1px !important;
            letter-spacing: 0.2px;
          }
        }
      `}</style>
    </div>
  );
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
