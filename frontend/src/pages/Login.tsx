import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Mail, Lock, LogIn, UserCheck, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!password.trim()) { setError('Password is required.'); return; }
    if (isRegister && !username.trim()) { setError('Username is required.'); return; }
    
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, username, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setError('');
    setLoading(true);
    try {
      // Guest login with test credentials
      await login('guest@example.com', 'guest');
      navigate('/dashboard');
    } catch {
      setError('Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ChefHat size={28} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground font-serif">Recipe Creator</h1>
          <p className="text-muted-foreground text-sm text-center">Sign in to manage your pantry and recipes</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-8">
          <h2 className="text-lg font-semibold text-foreground mb-6">{isRegister ? 'Create Account' : 'Sign In'}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="your_username"
                  className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="chef@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : isRegister ? (
                <UserPlus size={16} />
              ) : (
                <LogIn size={16} />
              )}
              {loading ? (isRegister ? 'Creating…' : 'Signing in…') : (isRegister ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-card px-3">or</span>
            </div>
          </div>

          <button
            onClick={handleGuest}
            type="button"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-border bg-muted text-muted-foreground font-medium rounded-lg text-sm hover:bg-secondary hover:text-secondary-foreground transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <UserCheck size={16} />
            Continue as Guest
          </button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            {isRegister ? (
              <>Already have an account? <button type="button" onClick={() => { setIsRegister(false); setError(''); }} className="text-primary hover:underline">Sign in</button></>
            ) : (
              <>New user? <button type="button" onClick={() => { setIsRegister(true); setError(''); }} className="text-primary hover:underline">Create account</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
