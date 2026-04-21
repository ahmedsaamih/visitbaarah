import { db } from "@/db";
import { bookings, cancellationRequests, roomTypes, rooms } from "@/db/schema";
import { eq, sql, count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Fetch statistics
  const [pendingBookings] = await db
    .select({ count: count() })
    .from(bookings)
    .where(eq(bookings.status, "pending"));

  const [confirmedBookings] = await db
    .select({ count: count() })
    .from(bookings)
    .where(eq(bookings.status, "confirmed"));

  const [pendingCancellations] = await db
    .select({ count: count() })
    .from(cancellationRequests)
    .where(eq(cancellationRequests.status, "pending"));

  const [totalRooms] = await db.select({ count: count() }).from(rooms);
  
  const [totalRoomTypes] = await db.select({ count: count() }).from(roomTypes);

  const stats = [
    { label: "Pending Bookings", value: pendingBookings.count, color: "var(--admin-warning)" },
    { label: "Confirmed Bookings", value: confirmedBookings.count, color: "var(--admin-success)" },
    { label: "Pending Cancellations", value: pendingCancellations.count, color: "var(--admin-error)" },
    { label: "Total Rooms", value: totalRooms.count, color: "var(--admin-accent)" },
  ];

  // Fetch recent bookings
  const recentBookings = await db.query.bookings.findMany({
    limit: 5,
    orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
    with: {
      roomType: true,
    },
  });

  return (
    <div>
      <div className="title-row">
        <h1>Dashboard</h1>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "24px",
        marginBottom: "32px"
      }}>
        {stats.map((stat) => (
          <div key={stat.label} className="card" style={{ marginBottom: 0 }}>
            <p style={{ fontSize: "14px", color: "var(--admin-text-light)", marginBottom: "8px" }}>
              {stat.label}
            </p>
            <p style={{ fontSize: "32px", fontWeight: "700", color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Recent Bookings</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Room Type</th>
                <th>Dates</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <div style={{ fontWeight: "600" }}>{booking.guestName}</div>
                    <div style={{ fontSize: "12px", color: "var(--admin-text-light)" }}>{booking.referenceId}</div>
                  </td>
                  <td>{booking.roomType.name}</td>
                  <td>
                    {new Date(booking.checkIn).toLocaleDateString()} &rarr; {new Date(booking.checkOut).toLocaleDateString()}
                  </td>
                  <td>${booking.totalAmount}</td>
                  <td>
                    <span className={`badge badge-${booking.status}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "var(--admin-text-light)" }}>
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
