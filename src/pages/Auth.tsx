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

  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
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
            <span>Megadiscountstore</span>
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
              <span>Megadiscountstore</span>
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

          {/* Social Login - Google (Optional UX add) */}
          {isLogin && (
            <div className="mt-6">
              <Button 
                variant="outline" 
                className="w-full h-12 bg-white border-[var(--color-border-default)] hover:bg-[var(--color-surface-page)]"
                type="button"
              >
                <Mail className="mr-2 size-5" />
                Log in with Google
              </Button>
            </div>
          )}

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

