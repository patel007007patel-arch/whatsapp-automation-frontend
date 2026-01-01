import { Link, useNavigate } from 'react-router';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { useState } from 'react';
import { authAPI } from 'src/services/api';

const AuthForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authAPI.forgotPassword(email);
      setSent(true);
      alert(data.message || 'Password reset link sent to your email');
    } catch (error: any) {
      alert(error.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            If an account exists with this email, a password reset link has been sent.
          </p>
          <Button onClick={() => navigate('/auth/auth2/login')} className="w-full">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <form className="mt-6" onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="email">Email</Label>
          </div>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>
      <div className="flex gap-2 text-base text-ld font-medium mt-6 items-center justify-center">
        <p>Remember your password?</p>
        <Link
          to="/auth/auth2/login"
          className="text-primary text-sm font-medium"
        >
          Sign in
        </Link>
      </div>
    </>
  );
};

export default AuthForgotPassword;
