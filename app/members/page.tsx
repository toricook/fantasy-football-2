import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";

export default function MembersPage() {
  return (
    <div>
      {/* Navigation */}
      <Navbar />

      {/* Content */}
      <div style={{border: '1px solid black', padding: '10px', margin: '5px'}}>
        Members Content
      </div>

      {/* Footer*/}
      <Footer />

    </div>
    
  );
}