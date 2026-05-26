import { db } from "@/db";
import { bookings, cancellationRequests, rooms } from "@/db/schema";
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

  const stats = [
    { label: "Pending Bookings", value: pendingBookings.count, color: "var(--admin-warning)", href: "/admin/bookings" },
    { label: "Confirmed Bookings", value: confirmedBookings.count, color: "var(--admin-success)", href: "/admin/bookings" },
    { label: "Pending Cancellations", value: pendingCancellations.count, color: "var(--admin-error)", href: "/admin/cancellations" },
    { label: "Total Rooms", value: totalRooms.count, color: "var(--admin-accent)", href: "/admin/rooms" },
  ];

  // Fetch recent bookings
  const recentBookings = await db.query.bookings.findMany({
    limit: 5,
    orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
    with: { roomType: true, business: true },
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
          <a key={stat.label} href={stat.href} className="card" style={{ marginBottom: 0, textDecoration: "none", display: "block", transition: "box-shadow 150ms" }}>
            <p style={{ fontSize: "14px", color: "var(--admin-text-light)", marginBottom: "8px" }}>
              {stat.label}
            </p>
            <p style={{ fontSize: "32px", fontWeight: "700", color: stat.color, margin: 0 }}>
              {stat.value}
            </p>
          </a>
        ))}
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ margin: 0 }}>Recent Bookings</h2>
          <a href="/admin/bookings" style={{ fontSize: "13px", color: "var(--admin-accent)", textDecoration: "none", fontWeight: 600 }}>View all →</a>
        </div>
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
                  <td>{booking.roomType?.name ?? booking.business?.name ?? "—"}</td>
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
