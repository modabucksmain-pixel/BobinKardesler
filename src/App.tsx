import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Router } from './Router';
import { SystemStatusBanner } from './components/SystemStatusBanner';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <SystemStatusBanner />
        <Router />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
