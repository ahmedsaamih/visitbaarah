import { db } from "@/db";
import Navbar from "@/components/public/Navbar";
import Hero from "@/components/public/Hero";
import RoomTypesSection from "@/components/public/RoomTypesSection";
import ActivitiesSection from "@/components/public/ActivitiesSection";
import ExperienceSection from "@/components/public/ExperienceSection";
import BookingSection from "@/components/public/BookingSection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // SSR Data Fetching
  const [
    roomTypes,
    activities,
    tours,
    menuItems,
    services,
    gallery,
    testimonials,
    settings
  ] = await Promise.all([
    db.query.roomTypes.findMany(),
    db.query.activities.findMany({ where: (t, { eq }) => eq(t.isActive, true) }),
    db.query.tours.findMany({ where: (t, { eq }) => eq(t.isActive, true) }),
    db.query.menuItems.findMany({ where: (t, { eq }) => eq(t.isAvailable, true) }),
    db.query.services.findMany({ where: (t, { eq }) => eq(t.isActive, true) }),
    db.query.gallery.findMany({ limit: 12 }),
    db.query.testimonials.findMany({ where: (t, { eq }) => eq(t.isPublished, true) }),
    db.query.settings.findMany()
  ]);

  const heroImage = settings.find(s => s.key === "hero_image_url")?.value;

  return (
    <main>
      <Navbar />
      <Hero imageUrl={heroImage} />
      
      {/* About Section */}
      <section id="about" className="section" style={{ background: "#fff" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
          <div className="reveal">
            <h4 style={{ color: "var(--gold)", letterSpacing: "2px", marginBottom: "16px" }}>OUR STORY</h4>
            <h2 style={{ fontSize: "48px", marginBottom: "24px" }}>Authentic Island Living</h2>
            <p style={{ color: "var(--text-light)", marginBottom: "24px" }}>
              Nestled in the heart of the lush island of AA. Thoddoo, Serene Seaview offers a unique blend of traditional island charm and modern comfort. 
              Our mission is to provide an immersive experience that connects you with the vibrant culture and natural beauty of the Maldives.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div>
                <h3 style={{ fontSize: "32px", color: "var(--teal)" }}>15+</h3>
                <p style={{ fontSize: "14px", color: "var(--text-light)" }}>Years of Hospitality</p>
              </div>
              <div>
                <h3 style={{ fontSize: "32px", color: "var(--teal)" }}>2000+</h3>
                <p style={{ fontSize: "14px", color: "var(--text-light)" }}>Happy Guests</p>
              </div>
            </div>
          </div>
          <div className="reveal" style={{ position: "relative" }}>
            <div style={{ 
              width: "100%", 
              aspectRatio: "4/5", 
              background: "var(--border)", 
              borderRadius: "20px",
              overflow: "hidden"
            }}>
              <div style={{ width: "100%", height: "100%", background: "url(/images/hero.png) center/cover" }} />
            </div>
            <div style={{ 
              position: "absolute", 
              bottom: "-30px", 
              left: "-30px", 
              width: "200px", 
              height: "200px", 
              background: "var(--gold)", 
              borderRadius: "16px",
              zIndex: -1 
            }} />
          </div>
        </div>
      </section>

      <RoomTypesSection roomTypes={roomTypes} />
      
      <ActivitiesSection activities={activities} />

      <ExperienceSection 
        menuItems={menuItems} 
        services={services} 
        gallery={gallery} 
      />

      {/* Testimonials */}
      <section id="reviews" className="section" style={{ background: "#fff" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "64px" }} className="reveal">
            <h4 style={{ color: "var(--gold)", letterSpacing: "2px", marginBottom: "16px" }}>GUEST REVIEWS</h4>
            <h2 style={{ fontSize: "48px" }}>What Our Guests Say</h2>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px" }}>
            {testimonials.map(item => (
              <div key={item.id} className="card-island reveal" style={{ padding: "40px" }}>
                <div style={{ color: "var(--gold)", fontSize: "24px", marginBottom: "20px" }}>
                  {"★".repeat(item.rating)}{"☆".repeat(5-item.rating)}
                </div>
                <p style={{ fontStyle: "italic", marginBottom: "32px", color: "var(--text)" }}>"{item.content}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                   <div style={{ width: "50px", height: "50px", background: "var(--teal)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700" }}>
                     {item.guestName.charAt(0)}
                   </div>
                   <div>
                     <div style={{ fontWeight: "700" }}>{item.guestName}</div>
                     <div style={{ fontSize: "12px", color: "var(--text-light)" }}>{item.guestCountry}</div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BookingSection roomTypes={roomTypes} />
      
      <footer style={{ background: "var(--teal)", color: "#fff", padding: "80px 0 40px" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "40px", marginBottom: "60px" }}>
            <div>
              <h2 style={{ color: "#fff", marginBottom: "24px", fontFamily: "var(--font-serif)" }}>SERENE</h2>
              <p style={{ opacity: 0.7, maxWidth: "300px", fontSize: "14px" }}>
                Dedicated to providing the most authentic and relaxing Maldivian island experience since 2011.
              </p>
            </div>
            <div>
              <h4 style={{ marginBottom: "24px", fontSize: "16px" }}>Navigation</h4>
              <nav style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
                <a href="#about" style={{ color: "#fff", opacity: 0.7, textDecoration: "none" }}>About Us</a>
                <a href="#rooms" style={{ color: "#fff", opacity: 0.7, textDecoration: "none" }}>Accommodation</a>
                <a href="#activities" style={{ color: "#fff", opacity: 0.7, textDecoration: "none" }}>Experiences</a>
                <a href="#booking" style={{ color: "#fff", opacity: 0.7, textDecoration: "none" }}>Book Now</a>
              </nav>
            </div>
             <div>
               <h4 style={{ marginBottom: "24px", fontSize: "16px" }}>Contact</h4>
               <p style={{ fontSize: "14px", opacity: 0.7, lineHeight: "1.8" }}>
                 AA. Thoddoo, Maldives<br/>
                 info@sereneseaview.com<br/>
                 +960 777 0000
               </p>
            </div>
            <div>
               <h4 style={{ marginBottom: "24px", fontSize: "16px" }}>Follow Us</h4>
               <div style={{ display: "flex", gap: "16px" }}>
                 {/* Social Icons Placeholder */}
                 <div style={{ width: "32px", height: "32px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
                 <div style={{ width: "32px", height: "32px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
                 <div style={{ width: "32px", height: "32px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
               </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "30px", textAlign: "center", fontSize: "12px", opacity: 0.5 }}>
            &copy; {new Date().getFullYear()} Serene Seaview. Design inspired by Travlla. All rights reserved.
          </div>
        </div>
      </footer>

      {/* GSAP Initialization */}
      <script dangerouslySetInnerHTML={{ __html: `
        window.addEventListener('load', () => {
          if (window.gsap && window.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);
            
            gsap.utils.toArray('.reveal').forEach((elem) => {
              gsap.to(elem, {
                scrollTrigger: {
                  trigger: elem,
                  start: 'top 90%',
                  toggleActions: 'play none none none'
                },
                y: 0,
                opacity: 1,
                duration: 1.2,
                ease: 'power3.out'
              });
            });
          }
        });
      `}} />
    </main>
  );
}
