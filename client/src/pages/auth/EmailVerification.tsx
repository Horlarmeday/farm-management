import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';
import { CheckCircle, XCircle, ArrowLeft, Mail } from 'lucide-react';

type VerificationState = 'loading' | 'success' | 'error' | 'invalid-token';

const EmailVerification: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [verificationState, setVerificationState] = useState<VerificationState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  // Verify email on component mount
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationState('invalid-token');
        return;
      }

      try {
        await authService.verifyEmail(token);
        setVerificationState('success');
        toast({
          title: 'Email Verified Successfully',
          description: 'Your email has been verified. You can now log in to your account.',
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        setVerificationState('error');
        setErrorMessage(
          error.response?.data?.message || 
          'Failed to verify email. The verification link may be invalid or expired.'
        );
        toast({
          title: 'Email Verification Failed',
          description: error.response?.data?.message || 'Failed to verify email. Please try again.',
          variant: 'destructive',
        });
      }
    };

    verifyEmail();
  }, [token, navigate, toast]);

  const handleResendVerification = async () => {
    setIsResending(true);
    
    try {
      // This would typically require the user's email
      // For now, we'll show a message to contact support
      toast({
        title: 'Resend Request',
        description: 'Please contact support or try registering again to receive a new verification email.',
      });
    } catch (error: any) {
      toast({
        title: 'Resend Failed',
        description: 'Failed to resend verification email. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  // Loading state
  if (verificationState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Verifying Email</CardTitle>
            <CardDescription>
              Please wait while we verify your email address...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Success state
  if (verificationState === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Email Verified Successfully</CardTitle>
            <CardDescription>
              Your email address has been verified successfully.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your account is now active! You can log in and start using the farm management system.
                  You will be redirected to the login page in a few seconds.
                </AlertDescription>
              </Alert>
              <Button asChild className="w-full">
                <Link to="/login">Go to Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid token state
  if (verificationState === 'invalid-token') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Invalid Verification Link</CardTitle>
            <CardDescription>
              This email verification link is invalid or missing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  The email verification link you clicked is invalid or incomplete. 
                  Please check your email for the correct verification link.
                </AlertDescription>
              </Alert>
              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Requesting New Link...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Request New Verification Email
                    </>
                  )}
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Verification Failed</CardTitle>
          <CardDescription>
            We couldn't verify your email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
            <div className="flex flex-col space-y-2">
              <Button 
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Requesting New Link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Request New Verification Email
                  </>
                )}
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/register">
                  Try Registration Again
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;