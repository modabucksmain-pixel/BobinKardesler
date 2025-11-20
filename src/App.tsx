import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Router } from './Router';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
