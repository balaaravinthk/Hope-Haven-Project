import Navbar from "../components/Navbar";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";

function Contact() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f2faf5] to-[#e6f6ee]">
      <Navbar />
      <main className="flex-1 pt-20">
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

export default Contact;
