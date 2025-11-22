import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/sonner'
import { AuthProvider } from './contexts/AuthContext'
import { setTokenSetter } from './lib/axios'
import { useAuth } from './contexts/AuthContext'

function AxiosAuthConnector() {
  const { setAccessToken } = useAuth();
  
  useEffect(() => {
    setTokenSetter(setAccessToken);
  }, [setAccessToken]);
  
  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AxiosAuthConnector />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
      >
        <App />
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
