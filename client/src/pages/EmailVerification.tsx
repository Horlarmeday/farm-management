import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';

interface VerificationState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const EmailVerification: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<VerificationState>({
    loading: true,
    success: false,
    error: null
  });

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setState({
          loading: false,
          success: false,
          error: 'Invalid verification link. No token provided.'
        });
        return;
      }

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        await authService.verifyEmail(token);
        
        setState({
          loading: false,
          success: true,
          error: null
        });
        
        toast({
          title: 'Email Verified',
          description: 'Your email has been successfully verified. You can now log in.',
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Failed to verify email. The token may be invalid or expired.';
        
        setState({
          loading: false,
          success: false,
          error: errorMessage
        });
        
        toast({
          title: 'Verification Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    };

    verifyEmail();
  }, [token, navigate, toast]);

  const handleReturnToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Verifying your email address
          </p>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {state.loading && (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  Verifying Email
                </>
              )}
              {state.success && (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  Email Verified
                </>
              )}
              {state.error && (
                <>
                  <XCircle className="h-6 w-6 text-red-600" />
                  Verification Failed
                </>
              )}
            </CardTitle>
            <CardDescription>
              {state.loading && 'Please wait while we verify your email address...'}
              {state.success && 'Your email has been successfully verified!'}
              {state.error && 'There was a problem verifying your email.'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {state.loading && (
              <div className="text-center py-4">
                <div className="animate-pulse">
                  <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            )}
            
            {state.success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Your email has been verified successfully. You will be redirected to the login page in a few seconds.
                </AlertDescription>
              </Alert>
            )}
            
            {state.error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {state.error}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleReturnToLogin}
                className="w-full"
                variant={state.success ? "default" : "outline"}
              >
                {state.success ? 'Continue to Login' : 'Return to Login'}
              </Button>
              
              {state.error && (
                <Link to="/forgot-password" className="w-full">
                  <Button variant="ghost" className="w-full">
                    Request New Verification Email
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <Link to="/contact" className="font-medium text-blue-600 hover:text-blue-500">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;