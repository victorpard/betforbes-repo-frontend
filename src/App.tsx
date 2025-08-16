import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

/**
 * Side-effect imports IMPORTANTES:
 * - Injeta automaticamente Authorization: Bearer <token> em chamadas /api
 * - Captura ?ref= do URL e salva (para ser enviado no /auth/register)
 *
 * Obs.: se você também importar estes arquivos no entrypoint (src/main.tsx),
 * remova um dos lados para evitar interceptors duplicados.
 */
import '@/interceptors/axiosAuthGlobal';
import '@/interceptors/referralCapture';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] text-white">
                Carregando…
              </div>
            }
          >
            <RouterProvider router={router} />
          </Suspense>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
