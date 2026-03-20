import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AudioProvider } from "./components/AudioProvider";
import { ArtistAudioProvider } from "./components/ArtistAudioProvider";
import ArtistMiniPlayer from "./components/ArtistMiniPlayer";
import Splash from "./pages/Splash.tsx";
import Index from "./pages/Index.tsx";
import DayPage from "./pages/DayPage.tsx";
import ArtistPlayer from "./pages/ArtistPlayer.tsx";
import AudioAdmin from "./pages/AudioAdmin.tsx";
import AdminSpotlight from "./pages/AdminSpotlight.tsx";
import AdminPromo from "./pages/AdminPromo.tsx";
import NewArtist from "./pages/NewArtist.tsx";
import Studios from "./pages/Studios.tsx";
import NotFound from "./pages/NotFound.tsx";

const SplashGate = () => {
  const seen = localStorage.getItem("vv_intro_seen");
  return seen ? <Navigate to="/home" replace /> : <Splash />;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AudioProvider>
        <ArtistAudioProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<SplashGate />} />
              <Route path="/home" element={<Index />} />
              <Route path="/admin/audio" element={<AudioAdmin />} />
              <Route path="/admin/spotlight" element={<AdminSpotlight />} />
              <Route path="/admin/promo" element={<AdminPromo />} />
              <Route path="/artist-player" element={<ArtistPlayer />} />
              <Route path="/studios" element={<Studios />} />
              <Route path="/:day" element={<DayPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ArtistMiniPlayer />
          </BrowserRouter>
        </ArtistAudioProvider>
      </AudioProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
