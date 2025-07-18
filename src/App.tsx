import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  // Debug: início da renderização do App
  console.log('🚧 App: render start');

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

// Debug: fim da renderização do App
console.log('🚧 App: render end');

export default App;
