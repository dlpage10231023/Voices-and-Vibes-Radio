import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import RecordBar from "@/components/RecordBar";
import HomeBottomBar from "@/components/HomeBottomBar";
import Ticker from "@/components/Ticker";
import About from "@/components/About";
import ListenNow from "@/components/ListenNow";
import WeeklySchedule from "@/components/WeeklySchedule";
import GospelSunday from "@/components/GospelSunday";
import ArtistSpotlight from "@/components/ArtistSpotlight";
import BookSpotlight from "@/components/BookSpotlight";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";


const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-[76px] overflow-x-hidden">
      <Navbar />
      <RecordBar />
      <Hero />
      <Ticker />
      <About />
      <ListenNow />
      <WeeklySchedule />
      <GospelSunday />
      <ArtistSpotlight />
      <BookSpotlight />
      <Contact />
      <Footer />
      
    </div>
  );
};

export default Index;
