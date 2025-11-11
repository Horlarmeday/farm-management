import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Cleanup: Unregister any existing service workers
const unregisterServiceWorkers = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('Service worker unregistered successfully');
      }
    } catch (error) {
      console.warn('Failed to unregister service workers:', error);
    }
  }
};

// Run cleanup before app initialization
unregisterServiceWorkers().catch((error) => {
  console.warn('Service worker cleanup failed:', error);
});

// Render app
createRoot(document.getElementById('root')!).render(<App />);
