import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Router } from './Router';

function App() {
  useEffect(() => {
    document.body.style.setProperty('--background-color', '#040805');
    document.body.style.setProperty('--foreground-color', '#e5e7eb');
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <Router />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
