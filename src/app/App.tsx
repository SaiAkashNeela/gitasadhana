import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProgressProvider } from "@/hooks/useUserProgress";
import { AudioProvider } from "@/hooks/useAudioPlayer";
import {
  Welcome,
  Onboarding,
  LanguageSelect,
  HomeScreen,
  ChaptersList,
  ChapterDetail,
  ChapterVerses,
  VerseReading,
  VerseCommentary,
  VerseWords,
  SearchScreen,
  SearchResults,
  WisdomScreen,
  WisdomThemes,
  WisdomThemeDetail,
  Bookmarks,
  Favorites,
  Notes,
  HistoryScreen,
  Player,
  Journey,
  Reminders,
  Notifications,
  Downloads,
  Settings,
  Profile,
} from "./screens";

// Instantiate TanStack React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProgressProvider>
        <AudioProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/onboarding/:step" element={<Onboarding />} />
              <Route path="/language" element={<LanguageSelect />} />
              <Route path="/home" element={<HomeScreen />} />
              <Route path="/chapters" element={<ChaptersList />} />
              <Route path="/chapter/:id" element={<ChapterDetail />} />
              <Route path="/chapter/:id/verses" element={<ChapterVerses />} />
              <Route path="/verse/:id" element={<VerseReading />} />
              <Route path="/verse/:id/commentary" element={<VerseCommentary />} />
              <Route path="/verse/:id/words" element={<VerseWords />} />
              <Route path="/search" element={<SearchScreen />} />
              <Route path="/search/results" element={<SearchResults />} />
              <Route path="/wisdom" element={<WisdomScreen />} />
              <Route path="/wisdom/themes" element={<WisdomThemes />} />
              <Route path="/wisdom/theme/:id" element={<WisdomThemeDetail />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/history" element={<HistoryScreen />} />
              <Route path="/player" element={<Player />} />
              <Route path="/journey" element={<Journey />} />
              <Route path="/reminders" element={<Reminders />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/downloads" element={<Downloads />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
        </AudioProvider>
      </UserProgressProvider>
    </QueryClientProvider>
  );
}
