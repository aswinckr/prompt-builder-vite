import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect, useLocation } from 'react-router-dom';
import { ContextLibrary } from './components/ContextLibrary';
import { PromptBuilder } from './components/PromptBuilder';
import { BottomTabNavigation } from './components/BottomTabNavigation';
import { RouteTransition } from './components/ui/RouteTransition';
import { LibraryProvider } from './contexts/LibraryContext';
import { AuthProvider } from './contexts/AuthContext';

function AppContent() {
  return (
    <div className="h-screen bg-neutral-900 overflow-hidden relative">
      <Switch>
        <Route exact path="/">
          <Redirect to="/prompt" />
        </Route>
        <Route path="/prompt">
          <RouteTransition>
            <PromptBuilder />
          </RouteTransition>
        </Route>
        <Route path="/knowledge">
          <RouteTransition>
            <ContextLibrary />
          </RouteTransition>
        </Route>
      </Switch>
      <BottomTabNavigation />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <Router>
          <AppContent />
        </Router>
      </LibraryProvider>
    </AuthProvider>
  );
}

export default App;
