import { Link, useNavigate, useSearchParams } from "react-router";
import CardBox from "src/components/shared/CardBox";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { useState, useEffect } from "react";
import { authAPI } from "src/services/api";
import FullLogo from "src/layouts/full/shared/logo/FullLogo";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    // Try to get token from query params
    let resetToken = searchParams.get('token');
    
    // If not found in query params, try to extract from URL hash or full URL
    if (!resetToken) {
      const urlParams = new URLSearchParams(window.location.search);
      resetToken = urlParams.get('token');
    }
    
    // If still not found, try to get from hash
    if (!resetToken && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      resetToken = hashParams.get('token');
    }
    
    setToken(resetToken);
    setCheckingToken(false);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!token) {
      alert('Invalid reset token');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(token, password);
      alert('Password reset successfully!');
      navigate('/auth/auth2/login');
    } catch (error: any) {
      alert(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking for token
  if (checkingToken) {
    return (
      <div className="relative overflow-hidden h-screen bg-lightprimary dark:bg-darkprimary">
        <div className="flex h-full justify-center items-center px-4">
          <CardBox className="md:w-[450px] w-full border-none">
            <div className="mx-auto">
              <FullLogo />
            </div>
            <p className="text-center text-muted-foreground">
              Loading...
            </p>
          </CardBox>
        </div>
      </div>
    );
  }

  // Show error if no token found
  if (!token) {
    return (
      <div className="relative overflow-hidden h-screen bg-lightprimary dark:bg-darkprimary">
        <div className="flex h-full justify-center items-center px-4">
          <CardBox className="md:w-[450px] w-full border-none">
            <div className="mx-auto">
              <FullLogo />
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">Invalid Reset Link</h2>
            <p className="text-center text-muted-foreground mb-4">
              The password reset link is invalid or has expired. Please request a new password reset link.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link to="/auth/auth2/forgot-password">Request New Reset Link</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/auth/auth2/login">Back to Login</Link>
              </Button>
            </div>
          </CardBox>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden h-screen bg-lightprimary dark:bg-darkprimary">
        <div className="flex h-full justify-center items-center px-4">
          <CardBox className="md:w-[450px] w-full border-none">
            <div className="mx-auto">
              <FullLogo />
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">Reset Password</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Enter your new password below.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
            <div className="flex gap-2 text-base text-ld font-medium mt-6 items-center justify-center">
              <Link
                to="/auth/auth2/login"
                className="text-primary text-sm font-medium"
              >
                Back to Login
              </Link>
            </div>
          </CardBox>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;

