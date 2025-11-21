import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Router } from './Router';

function App() {
  useEffect(() => {
    const setThemeByTime = () => {
      const hour = new Date().getHours();
      const isGreenTheme = hour >= 13;
      const backgroundColor = isGreenTheme ? '#0c1910' : '#0b1224';

      document.body.style.setProperty('--background-color', backgroundColor);
    };

    setThemeByTime();
    const interval = setInterval(setThemeByTime, 60 * 1000);

    return () => clearInterval(interval);
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
