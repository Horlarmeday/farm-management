import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Database, RefreshCw, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface CacheStats {
  cacheNames: string[];
  totalCaches: number;
  serviceWorkerStatus: string;
}

export const CacheManager: React.FC = () => {
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadCacheStats = async () => {
    try {
      const cacheNames = await caches.keys();
      const swRegistration = await navigator.serviceWorker.getRegistration();

      setCacheStats({
        cacheNames,
        totalCaches: cacheNames.length,
        serviceWorkerStatus: swRegistration ? 'active' : 'inactive',
      });
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    }
  };

  useEffect(() => {
    loadCacheStats();
  }, []);

  const clearAllCaches = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));

      setMessage({
        type: 'success',
        text: `Successfully cleared ${cacheNames.length} cache(s)`,
      });

      await loadCacheStats();
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          'Failed to clear caches: ' + (error instanceof Error ? error.message : 'Unknown error'),
      });
    } finally {
      setLoading(false);
    }
  };

  const unregisterServiceWorker = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }

      setMessage({
        type: 'success',
        text: `Service Worker unregistered. Refresh the page to reinstall.`,
      });

      await loadCacheStats();
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          'Failed to unregister Service Worker: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      });
    } finally {
      setLoading(false);
    }
  };

  const clearAndReload = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));

      // Unregister service worker
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }

      // Reload page
      window.location.reload();
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          'Failed to clear cache and reload: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      });
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Cache Management
        </CardTitle>
        <CardDescription>
          Manage browser cache. Clear cache if you experience stale data issues. Service workers
          have been disabled to prevent caching issues.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cache Stats */}
        {cacheStats && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Active Caches</p>
              <p className="text-2xl font-semibold">{cacheStats.totalCaches}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Service Worker</p>
              <p className="text-2xl font-semibold capitalize">{cacheStats.serviceWorkerStatus}</p>
            </div>
          </div>
        )}

        {/* Cache Names */}
        {cacheStats && cacheStats.cacheNames.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Cache Stores:</p>
            <div className="space-y-1">
              {cacheStats.cacheNames.map((name) => (
                <div
                  key={name}
                  className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Message */}
        {message && (
          <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button variant="outline" className="w-full" onClick={clearAllCaches} disabled={loading}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All Caches
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={unregisterServiceWorker}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Unregister Service Worker
          </Button>

          <Button variant="default" className="w-full" onClick={clearAndReload} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Clear Cache & Reload
          </Button>
        </div>

        {/* Information */}
        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
          <p>
            <strong>When to use:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Seeing old/stale data after updates</li>
            <li>Dashboard not reflecting latest changes</li>
            <li>After major app updates</li>
            <li>To clear old service worker caches (now disabled)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
