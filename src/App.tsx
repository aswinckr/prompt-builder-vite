import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ContextLibrary } from './components/ContextLibrary';
import { PromptBuilder } from './components/PromptBuilder';
import { BottomTabNavigation } from './components/BottomTabNavigation';
import { RouteTransition } from './components/ui/RouteTransition';
import { LibraryProvider } from './contexts/LibraryContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

function AppContent() {
  return (
    <div className="h-screen bg-neutral-900 overflow-hidden relative">
      <Routes>
        <Route path="/" element={<Navigate to="/prompt" replace />} />
        <Route path="/prompt" element={
          <RouteTransition>
            <PromptBuilder />
          </RouteTransition>
        } />
        <Route path="/knowledge" element={
          <RouteTransition>
            <ContextLibrary />
          </RouteTransition>
        } />
      </Routes>
      <BottomTabNavigation />
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