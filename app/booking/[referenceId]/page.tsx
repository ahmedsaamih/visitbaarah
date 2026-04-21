import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import Navbar from "@/components/public/Navbar";

export const dynamic = "force-dynamic";

export default async function BookingLookupPage({
  params,
}: {
  params: Promise<{ referenceId: string }>;
}) {
  const { referenceId } = await params;

  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.referenceId, referenceId),
    with: {
      roomType: true,
      addons: true,
    },
  });

  if (!booking) {
    return (
      <main style={{ background: "var(--cream)", minHeight: "100vh" }}>
        <Navbar />
        <div className="container" style={{ paddingTop: "150px", textAlign: "center" }}>
          <h1 style={{ fontSize: "40px", marginBottom: "24px" }}>Booking Not Found</h1>
          <p style={{ color: "var(--text-light)", marginBottom: "40px" }}>The booking reference <strong>{referenceId}</strong> could not be found.</p>
          <a href="/#booking" className="btn-luxury">Go Back</a>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "var(--cream)", minHeight: "100vh" }}>
      <Navbar />
      <div className="container" style={{ paddingTop: "150px", paddingBottom: "100px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: "40px" }}>
            <h4 style={{ color: "var(--gold)", letterSpacing: "2px", marginBottom: "16px" }}>BOOKING DETAILS</h4>
            <h1 style={{ fontSize: "48px" }}>Status: <span className={`text-${booking.status}`}>{booking.status.toUpperCase().replace('_', ' ')}</span></h1>
          </div>

          <div className="card-island reveal" style={{ padding: "40px", marginBottom: "40px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-light)", textTransform: "uppercase" }}>Reference ID</label>
                <div style={{ fontWeight: "700", fontSize: "20px", color: "var(--teal)" }}>{booking.referenceId}</div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-light)", textTransform: "uppercase" }}>Guest Name</label>
                <div style={{ fontWeight: "600" }}>{booking.guestName}</div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-light)", textTransform: "uppercase" }}>Dates</label>
                <div style={{ fontWeight: "600" }}>{new Date(booking.checkIn).toLocaleDateString()} &rarr; {new Date(booking.checkOut).toLocaleDateString()}</div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-light)", textTransform: "uppercase" }}>Accommodation</label>
                <div style={{ fontWeight: "600" }}>{booking.roomType.name}</div>
              </div>
            </div>
            
            <div style={{ marginTop: "40px", paddingTop: "30px", borderTop: "1px solid var(--border)" }}>
               <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px" }}>
                 <span>Total Amount</span>
                 <span style={{ fontWeight: "800", color: "var(--teal)" }}>${booking.totalAmount}</span>
               </div>
            </div>
          </div>

          {booking.status !== "cancelled" && booking.status !== "rejected" && (
            <div className="reveal" style={{ textAlign: "center" }}>
              <p style={{ fontSize: "14px", color: "var(--text-light)", marginBottom: "20px" }}>Need to change your plans?</p>
              <button 
                className="btn-outline-gold" 
                style={{ color: "var(--error)", borderColor: "var(--error)" }}
                // In a real app, this would trigger the cancel API
                onClick={() => alert("Please contact our support for cancellation: info@sereneguesthouse.com")}
              >
                Request Cancellation
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
