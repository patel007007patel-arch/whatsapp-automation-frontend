import { Link, useNavigate, useSearchParams } from "react-router";
import CardBox from "src/components/shared/CardBox";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { useState } from "react";
import { authAPI } from "src/services/api";
import FullLogo from "src/layouts/full/shared/logo/FullLogo";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

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

  if (!token) {
    return (
      <div className="relative overflow-hidden h-screen bg-lightprimary dark:bg-darkprimary">
        <div className="flex h-full justify-center items-center px-4">
          <CardBox className="md:w-[450px] w-full border-none">
            <div className="mx-auto">
              <FullLogo />
            </div>
            <p className="text-center text-muted-foreground">
              Invalid or missing reset token.
            </p>
            <Button asChild className="w-full mt-4">
              <Link to="/auth/auth2/login">Back to Login</Link>
            </Button>
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

