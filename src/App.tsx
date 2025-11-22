import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ContextLibrary } from './components/ContextLibrary';
import { PromptBuilder } from './components/PromptBuilder';
import { BottomTabNavigation } from './components/BottomTabNavigation';
import { LibraryProvider } from './contexts/LibraryContext';

function App() {
  return (
    <LibraryProvider>
      <Router>
        <div className="h-screen bg-neutral-900 overflow-hidden relative">
          <Routes>
            <Route path="/" element={<Navigate to="/prompt" replace />} />
            <Route path="/prompt" element={<PromptBuilder />} />
            <Route path="/knowledge" element={<ContextLibrary />} />
          </Routes>
          <BottomTabNavigation />
        </div>
      </Router>
    </LibraryProvider>
  );
}

export default App;
