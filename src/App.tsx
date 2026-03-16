import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import NotFound from "./pages/NotFound.tsx";

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
              <Route path="/" element={<Splash />} />
              <Route path="/home" element={<Index />} />
              <Route path="/admin/audio" element={<AudioAdmin />} />
              <Route path="/artist-player" element={<ArtistPlayer />} />
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
