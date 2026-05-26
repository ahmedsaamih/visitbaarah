"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type RoomItem = {
  id: number;
  roomNumber: string;
  roomType?: { name?: string | null } | null;
};

type AvailabilityItem = {
  id: number | string;
  roomId: number;
  date: string;
  isBlocked: boolean;
  reason?: string | null;
};

type AllRoomsRoom = {
  id: number;
  roomNumber: string;
  roomTypeName: string;
};

type AllRoomsBooking = {
  id: number;
  roomId: number;
  guestName: string;
  referenceId: string;
  checkIn: string;
  checkOut: string;
  status: string;
};

type AllRoomsBlock = {
  id: number;
  roomId: number;
  date: string;
  reason?: string | null;
};

type AllRoomsPayload = {
  year: number;
  rooms: AllRoomsRoom[];
  bookings: AllRoomsBooking[];
  manualBlocks: AllRoomsBlock[];
};

type BusinessOption = { id: number; name: string };

export default function AdminAvailability() {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
  const [viewMode, setViewMode] = useState<"by-room" | "all-rooms">("by-room");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [jumpMonth, setJumpMonth] = useState(
    selectedYear === new Date().getFullYear() ? new Date().getMonth() : 0
  );
  const [allRoomsPayload, setAllRoomsPayload] = useState<AllRoomsPayload | null>(null);
  const [allRoomsLoading, setAllRoomsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const allRoomsScrollerRef = useRef<HTMLDivElement | null>(null);
  const scrollToMonth = useCallback((year: number, monthIndex: number) => {
    const scroller = allRoomsScrollerRef.current;
    if (!scroller) return;
    const dayOffset = getDayOffsetInYear(year, monthIndex);
    const leftPaneWidth = 160;
    const columnWidth = 36;
    scroller.scrollTo({
      left: leftPaneWidth + dayOffset * columnWidth,
      behavior: "smooth",
    });
  }, []);

  const fetchData = async (bizId?: string) => {
    try {
      const [roomsRes, bizRes] = await Promise.all([
        fetch(bizId ? `/api/admin/rooms?businessId=${bizId}` : "/api/admin/rooms"),
        fetch("/api/admin/businesses"),
      ]);
      const roomData = roomsRes.ok ? await roomsRes.json() : [];
      const bizData = bizRes.ok ? await bizRes.json() : [];
      setRooms(roomData);
      setBusinesses(
        bizData
          .filter((b: any) => b.businessType === "guesthouse")
          .map((b: any) => ({ id: b.id, name: b.name }))
      );
      if (roomData.length > 0) setSelectedRoomId(roomData[0].id.toString());
      else setSelectedRoomId("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = useCallback(async () => {
    if (!selectedRoomId) return;
    
    // Fetch for the current month
    const start = formatLocalDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    const end = formatLocalDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));
    
    try {
      const res = await fetch(`/api/admin/availability?roomId=${selectedRoomId}&startDate=${start}&endDate=${end}`);
      const data = await res.json();
      setAvailability(data);
    } catch (error) {
      console.error(error);
    }
  }, [selectedRoomId, currentDate]);

  const fetchAllRoomsData = useCallback(async () => {
    setAllRoomsLoading(true);
    try {
      const bizParam = selectedBusinessId ? `&businessId=${selectedBusinessId}` : "";
      const res = await fetch(`/api/admin/availability?view=all-rooms&year=${selectedYear}${bizParam}`, {
        cache: "no-store",
      });
      const data = (await res.json()) as AllRoomsPayload;
      if (res.ok) {
        setAllRoomsPayload(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAllRoomsLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData(selectedBusinessId || undefined);
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedBusinessId]);

  useEffect(() => {
    if (viewMode !== "by-room") return;
    const timer = setTimeout(() => {
      void fetchAvailability();
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedRoomId, currentDate, viewMode, fetchAvailability]);

  useEffect(() => {
    if (viewMode !== "all-rooms") return;
    const timer = setTimeout(() => {
      void fetchAllRoomsData();
    }, 0);
    return () => clearTimeout(timer);
  }, [viewMode, selectedYear, fetchAllRoomsData]);

  useEffect(() => {
    if (viewMode !== "all-rooms") return;
    if (!allRoomsPayload) return;
    const monthIndex = selectedYear === new Date().getFullYear() ? new Date().getMonth() : 0;
    scrollToMonth(selectedYear, monthIndex);
  }, [viewMode, selectedYear, allRoomsPayload, scrollToMonth]);

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
      void fetchAvailability();
    } catch {
      alert("Update failed");
    }
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);
  const yearOptions = useMemo(() => {
    const thisYear = new Date().getFullYear();
    return [thisYear - 2, thisYear - 1, thisYear, thisYear + 1, thisYear + 2];
  }, []);
  const yearDates = useMemo(() => buildYearDates(selectedYear), [selectedYear]);
  const allRoomsById = useMemo(() => {
    const grouped = new Map<number, { bookings: AllRoomsBooking[]; blockedDates: Set<string> }>();
    if (!allRoomsPayload) return grouped;

    for (const room of allRoomsPayload.rooms) {
      grouped.set(room.id, { bookings: [], blockedDates: new Set<string>() });
    }
    for (const booking of allRoomsPayload.bookings) {
      const row = grouped.get(booking.roomId);
      if (!row) continue;
      row.bookings.push(booking);
    }
    for (const block of allRoomsPayload.manualBlocks) {
      const row = grouped.get(block.roomId);
      if (!row) continue;
      row.blockedDates.add(block.date);
    }
    return grouped;
  }, [allRoomsPayload]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="title-row">
        <h1>Room Availability</h1>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {businesses.length > 0 && (
            <select
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              className="btn btn-outline"
            >
              <option value="">All Properties</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
          <button
            className={viewMode === "by-room" ? "btn btn-primary" : "btn btn-outline"}
            onClick={() => setViewMode("by-room")}
          >
            By Rooms
          </button>
          <button
            className={viewMode === "all-rooms" ? "btn btn-primary" : "btn btn-outline"}
            onClick={() => setViewMode("all-rooms")}
          >
            All Rooms
          </button>
          {viewMode === "by-room" ? (
            <>
              <select value={selectedRoomId} onChange={(e) => setSelectedRoomId(e.target.value)} className="btn btn-outline">
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    Room {room.roomNumber} ({room.roomType?.name ?? "Unknown type"})
                  </option>
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
                {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </div>
              <button
                onClick={() =>
                  setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
                }
                className="btn btn-outline"
              >
                &gt;
              </button>
            </>
          ) : (
            <>
              <select
                value={selectedYear}
                className="btn btn-outline"
                onChange={(e) => {
                  const nextYear = Number(e.target.value);
                  setSelectedYear(nextYear);
                  setJumpMonth(nextYear === new Date().getFullYear() ? new Date().getMonth() : 0);
                }}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <select
                value={jumpMonth}
                className="btn btn-outline"
                onChange={(e) => setJumpMonth(Number(e.target.value))}
              >
                {MONTH_NAMES.map((monthName, idx) => (
                  <option key={monthName} value={idx}>
                    {monthName}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-outline"
                onClick={() => scrollToMonth(selectedYear, jumpMonth)}
              >
                Jump to Month
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card">
        {viewMode === "by-room" ? (
          <div
            className="availability-grid"
            style={{
              maxWidth: "1020px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "6px",
              textAlign: "center"
            }}
          >
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
              <div
                className="availability-weekday"
                key={dayName}
                style={{
                  fontWeight: "600",
                  fontSize: "12px",
                  color: "var(--admin-text-light)",
                  paddingBottom: "6px",
                  letterSpacing: "0.2px",
                }}
              >
                {dayName}
              </div>
            ))}
            {calendarDays.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} />;

              const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
              const avail = availability.find((item) => item.date.startsWith(dateStr));
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
        ) : (
          <div>
            <div style={{ fontSize: "13px", color: "var(--admin-text-light)", marginBottom: "10px" }}>
              Showing all rooms for {selectedYear}. Drag horizontally to navigate months.
            </div>
            <div
              ref={allRoomsScrollerRef}
              style={{
                overflowX: "auto",
                border: "1px solid var(--admin-border)",
                borderRadius: "10px",
                background: "white",
              }}
            >
              {allRoomsLoading ? (
                <div style={{ padding: "16px" }}>Loading yearly availability...</div>
              ) : (
                <div style={{ minWidth: `${160 + yearDates.length * 36}px` }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `160px repeat(${yearDates.length}, 36px)`,
                      position: "sticky",
                      top: 0,
                      zIndex: 3,
                      background: "#f8fafc",
                      borderBottom: "1px solid var(--admin-border)",
                    }}
                  >
                    <div
                      style={{
                        position: "sticky",
                        left: 0,
                        zIndex: 4,
                        background: "#f8fafc",
                        fontWeight: 700,
                        padding: "8px 10px",
                        borderRight: "1px solid var(--admin-border)",
                      }}
                    >
                      Room
                    </div>
                    {yearDates.map((dateStr, dateIndex) => (
                      <div
                        key={dateStr}
                        style={{
                          fontSize: "10px",
                          textAlign: "center",
                          padding: "8px 0",
                          borderRight: "1px solid #eef2f7",
                          color: dateIndex % 7 === 0 ? "#0f172a" : "var(--admin-text-light)",
                        }}
                        title={dateStr}
                      >
                        <div>{new Date(`${dateStr}T00:00:00Z`).getUTCDate()}</div>
                        {new Date(`${dateStr}T00:00:00Z`).getUTCDate() === 1 ? (
                          <div style={{ fontSize: "9px", fontWeight: 700, color: "#1e3a8a", lineHeight: 1.1 }}>
                            {MONTH_SHORT[new Date(`${dateStr}T00:00:00Z`).getUTCMonth()]}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  {(allRoomsPayload?.rooms ?? []).map((room) => {
                    const roomData = allRoomsById.get(room.id);
                    const roomBookings = roomData?.bookings ?? [];
                    const blockedDates = roomData?.blockedDates ?? new Set<string>();

                    return (
                      <div
                        key={room.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: `160px repeat(${yearDates.length}, 36px)`,
                          borderBottom: "1px solid #f1f5f9",
                          minHeight: "38px",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            position: "sticky",
                            left: 0,
                            zIndex: 2,
                            background: "white",
                            borderRight: "1px solid var(--admin-border)",
                            display: "flex",
                            alignItems: "center",
                            padding: "6px 10px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          Room {room.roomNumber}
                        </div>

                        {yearDates.map((dateStr) => (
                          <div
                            key={`${room.id}-${dateStr}`}
                            style={{
                              borderRight: "1px solid #f8fafc",
                              background: blockedDates.has(dateStr) ? "rgba(239, 68, 68, 0.08)" : "transparent",
                            }}
                            title={blockedDates.has(dateStr) ? "Manually blocked date" : ""}
                          />
                        ))}

                        {roomBookings.map((booking) => {
                          const startIndex = Math.max(0, daysBetween(`${selectedYear}-01-01`, booking.checkIn));
                          const endIndex = Math.min(yearDates.length, daysBetween(`${selectedYear}-01-01`, booking.checkOut));
                          const spanDays = Math.max(1, endIndex - startIndex);
                          const left = 160 + startIndex * 36;
                          const width = spanDays * 36;

                          return (
                            <div
                              key={booking.id}
                              style={{
                                position: "absolute",
                                left,
                                top: 5,
                                width,
                                height: 28,
                                borderRadius: "8px",
                                background: "linear-gradient(90deg, #1d4ed8, #2563eb)",
                                color: "white",
                                fontSize: "11px",
                                display: "flex",
                                alignItems: "center",
                                padding: "0 8px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                pointerEvents: "auto",
                              }}
                              title={`Ref: ${booking.referenceId}`}
                            >
                              {booking.guestName}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <p style={{ fontSize: "13px", color: "var(--admin-text-light)", marginTop: "16px" }}>
        {viewMode === "by-room"
          ? "* Click on a day to toggle between OPEN and BLOCKED for this room."
          : "* Booking bars show guest name. Hover a bar to view the booking reference ID."}
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

function buildYearDates(year: number) {
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));
  const dates: string[] = [];
  while (start < end) {
    dates.push(start.toISOString().split("T")[0]);
    start.setUTCDate(start.getUTCDate() + 1);
  }
  return dates;
}

function daysBetween(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.floor((end.getTime() - start.getTime()) / dayMs);
}

function getDayOffsetInYear(year: number, monthIndex: number) {
  return daysBetween(`${year}-01-01`, formatLocalDate(new Date(year, monthIndex, 1)));
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
