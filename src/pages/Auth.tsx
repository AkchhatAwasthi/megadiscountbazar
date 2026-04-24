import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Eye, EyeOff, Sparkles, Mail } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { AuthCharacters } from '@/components/Auth/AuthCharacters';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  const { signUp, signIn, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      // Note: On success, Supabase will redirect the page to Google, so we won't reach here immediately.
    } catch (error: any) {
      toast({
        title: "Google Sign-in Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        if (!formData.email || !formData.password) {
          throw new Error("Please fill in all fields.");
        }
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
        useStore.getState().triggerAnimation('welcome');
        navigate('/');
      } else {
        if (!formData.email || !formData.password || !formData.fullName || !formData.confirmPassword) {
          throw new Error("Please fill in all fields.");
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters long.");
        }

        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) throw error;

        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 font-inter">
      {/* Left Content Section - Character Animation */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-[var(--color-brand-red)]/90 via-[var(--color-brand-red)] to-[var(--color-brand-red-deep)] p-12 text-white overflow-hidden">
        <div className="relative z-20">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <div className="size-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
            <span>Megadiscountbazar</span>
          </Link>
        </div>

        <div className="relative z-20 flex items-end justify-center h-[500px]">
          <AuthCharacters 
            isTyping={isTyping} 
            passwordLength={formData.password.length} 
            showPassword={showPassword} 
          />
        </div>

        <div className="relative z-20 flex items-center gap-8 text-sm text-white/60">
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-white transition-colors">Contact</Link>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute top-1/4 right-1/4 size-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 size-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Right Login Section */}
      <div className="flex items-center justify-center p-8 bg-[var(--color-surface-page)]">
        <div className="w-full max-w-[420px]">
          {/* Mobile and Back Button */}
          <div className="flex items-center justify-between mb-12">
            <Link
              to="/"
              className="flex items-center gap-2 text-[14px] font-[500] text-[var(--color-text-secondary)] hover:text-[var(--color-brand-red)] transition-colors"
            >
              <ArrowLeft size={16} />
              Home
            </Link>
            <div className="lg:hidden flex items-center gap-2 text-lg font-semibold">
              <div className="size-8 rounded-lg bg-[var(--color-brand-red)]/10 flex items-center justify-center">
                <Sparkles className="size-4 text-[var(--color-brand-red)]" />
              </div>
              <span>Megadiscountbazar</span>
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-[var(--color-text-primary)]">
              {isLogin ? 'Welcome Back' : 'Join Us'}
            </h1>
            <p className="text-[var(--color-text-secondary)] text-sm">
              {isLogin ? 'Please enter your details to sign in' : 'Create an account to start shopping'}
            </p>
          </div>

          {/* Login/Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-[var(--color-text-primary)]">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="h-12 bg-white border-[var(--color-border-default)] focus:border-[var(--color-brand-red)]"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[var(--color-text-primary)]">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="hello@example.com"
                value={formData.email}
                autoComplete="off"
                onChange={handleInputChange}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                required
                className="h-12 bg-white border-[var(--color-border-default)] focus:border-[var(--color-brand-red)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-[var(--color-text-primary)]">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="h-12 pr-10 bg-white border-[var(--color-border-default)] focus:border-[var(--color-brand-red)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--color-text-primary)]">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="h-12 bg-white border-[var(--color-border-default)] focus:border-[var(--color-brand-red)]"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" className="border-[var(--color-border-default)] data-[state=checked]:bg-[var(--color-brand-red)]" />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal cursor-pointer text-[var(--color-text-secondary)]"
                >
                  Remember for 30 days
                </Label>
              </div>
              {isLogin && (
                <Link
                  to="#"
                  className="text-sm text-[var(--color-brand-red)] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-deep)] text-white" 
              size="lg" 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                isLogin ? 'Log In' : 'Create Account'
              )}
            </Button>
          </form>

          {/* Social Login - Google */}
          <div className="mt-6">
            <Button 
              variant="outline" 
              className="w-full h-12 bg-white border-[var(--color-border-default)] hover:bg-[var(--color-surface-page)] text-[var(--color-text-primary)]"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="mr-2 size-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              {isLogin ? 'Log in with Google' : 'Sign up with Google'}
            </Button>
          </div>

          {/* Toggle Login/Signup */}
          <div className="text-center text-sm text-[var(--color-text-secondary)] mt-8">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-[var(--color-text-primary)] font-medium hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          <div className="mt-12 pt-6 border-t border-[var(--color-border-default)] text-center">
            <p className="text-[12px] text-[var(--color-text-muted)] leading-relaxed">
              By signing in, you agree to our <Link to="#" className="underline">Terms of Service</Link> & <Link to="#" className="underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

