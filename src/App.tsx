import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ContextLibrary } from "./components/ContextLibrary";
import { PromptBuilder } from "./components/PromptBuilder";
import { ConversationHistory } from "./components/ConversationHistory";
import { ConversationDetail } from "./components/ConversationDetail";
import { BottomTabNavigation } from "./components/BottomTabNavigation";
import { Header } from "./components/Header";
import { RouteTransition } from "./components/ui/RouteTransition";
import { LibraryProvider } from "./contexts/LibraryContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";

function AppContent() {
  const location = useLocation();
  // Update isMainRoute to exclude /history from showing Header and BottomTabNavigation
  // Only show navigation on /prompt and /knowledge routes
  const isMainRoute =
    location.pathname === "/prompt" || location.pathname === "/knowledge";
  const isHistoryDetailRoute = location.pathname.startsWith("/history/");

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background">
      {/* Background glow effects - subtle and atmospheric */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/20 opacity-50 mix-blend-screen blur-[130px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] -translate-x-1/2 translate-y-1/2 rounded-full bg-purple-600/10 opacity-30 mix-blend-screen blur-[130px]" />
      </div>

      {/* Header - Only show on main routes (prompt and knowledge) */}
      {isMainRoute && <Header />}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/prompt" replace />} />
          <Route
            path="/prompt"
            element={
              <RouteTransition>
                <PromptBuilder />
              </RouteTransition>
            }
          />
          <Route
            path="/knowledge"
            element={
              <RouteTransition>
                <ContextLibrary />
              </RouteTransition>
            }
          />
          <Route
            path="/history"
            element={
              <RouteTransition>
                <ConversationHistory />
              </RouteTransition>
            }
          />
          <Route
            path="/history/:conversationId"
            element={
              <RouteTransition>
                <ConversationDetail />
              </RouteTransition>
            }
          />
        </Routes>
      </div>

      {/* Bottom Navigation - Only show on main routes (prompt and knowledge), not on history or detail views */}
      {!isHistoryDetailRoute && isMainRoute && <BottomTabNavigation />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <ToastProvider>
          <Router>
            <AppContent />
          </Router>
        </ToastProvider>
      </LibraryProvider>
    </AuthProvider>
  );
}

export default App;
