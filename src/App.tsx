import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { ContextLibrary } from './components/ContextLibrary';
import { PromptBuilder } from './components/PromptBuilder';
import { BottomTabNavigation } from './components/BottomTabNavigation';
import { LibraryProvider } from './contexts/LibraryContext';

function App() {
  return (
    <LibraryProvider>
      <Router>
        <div className="h-screen bg-neutral-900 overflow-hidden relative">
          <Switch>
            <Route exact path="/">
              <Redirect to="/prompt" />
            </Route>
            <Route path="/prompt">
              <PromptBuilder />
            </Route>
            <Route path="/knowledge">
              <ContextLibrary />
            </Route>
          </Switch>
          <BottomTabNavigation />
        </div>
      </Router>
    </LibraryProvider>
  );
}

export default App;
