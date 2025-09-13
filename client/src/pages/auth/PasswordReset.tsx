import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';
import { Eye, EyeOff, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

const PasswordReset: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validation, setValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Validate password in real-time
  useEffect(() => {
    setValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  // Verify token on component mount
  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      return;
    }

    // For now, assume token is valid if it exists
    // In a real app, you might want to verify the token with the server
    setIsValidToken(true);
  }, [token]);

  const isPasswordValid = Object.values(validation).every(Boolean);
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = isPasswordValid && doPasswordsMatch && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit || !token) return;

    setIsLoading(true);
    
    try {
      await authService.resetPassword({ token, newPassword: password });
      setIsSuccess(true);
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been reset successfully. You can now log in with your new password.',
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      toast({
        title: 'Password Reset Failed',
        description: error.response?.data?.message || 'Failed to reset password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Invalid token state
  if (isValidToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  The password reset link you clicked is either invalid or has expired. 
                  Please request a new password reset link.
                </AlertDescription>
              </Alert>
              <div className="flex flex-col space-y-2">
                <Button asChild className="w-full">
                  <Link to="/forgot-password">Request New Reset Link</Link>
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

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Password Reset Successful</CardTitle>
            <CardDescription>
              Your password has been reset successfully.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  You can now log in with your new password. You will be redirected to the login page in a few seconds.
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

  // Loading state
  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Main password reset form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Reset Your Password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Validation */}
            {password && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Password Requirements:</Label>
                <div className="space-y-1 text-sm">
                  <div className={`flex items-center space-x-2 ${
                    validation.minLength ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    <CheckCircle className={`h-3 w-3 ${
                      validation.minLength ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${
                    validation.hasUppercase ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    <CheckCircle className={`h-3 w-3 ${
                      validation.hasUppercase ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <span>One uppercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${
                    validation.hasLowercase ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    <CheckCircle className={`h-3 w-3 ${
                      validation.hasLowercase ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <span>One lowercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${
                    validation.hasNumber ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    <CheckCircle className={`h-3 w-3 ${
                      validation.hasNumber ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <span>One number</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${
                    validation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    <CheckCircle className={`h-3 w-3 ${
                      validation.hasSpecialChar ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <span>One special character</span>
                  </div>
                </div>
              </div>
            )}

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {confirmPassword && !doPasswordsMatch && (
                <p className="text-sm text-red-600">Passwords do not match</p>
              )}
              {confirmPassword && doPasswordsMatch && (
                <p className="text-sm text-green-600">Passwords match</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={!canSubmit}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>

            {/* Back to Login Link */}
            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:text-blue-500 flex items-center justify-center"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordReset;