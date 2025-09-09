import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-6xl font-bold text-gray-400">404</div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription>
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link to="/dashboard" className="flex items-center justify-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Go to Dashboard</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/" className="flex items-center justify-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Go Back</span>
              </Link>
            </Button>
          </div>
          
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground mb-2">
              Looking for something specific?
            </p>
            <Button variant="ghost" size="sm" className="text-xs">
              <Search className="h-3 w-3 mr-1" />
              Search our help center
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}