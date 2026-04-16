import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
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
    <main className="flex min-h-screen font-sans bg-[#F6F7F8]">
      {/* Left Side - Image Board */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-white">
        <img
          alt="Premium Hypermarket Shopping"
          className="absolute inset-0 w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80"
        />
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute bottom-16 left-16 right-16 text-white text-left">
          <h2 className="text-[44px] font-[600] tracking-[-0.03em] leading-[1.1] mb-4">
            Everything you need, <br />all in one place.
          </h2>
          <p className="text-[17px] font-[400] text-white/90 max-w-md leading-[1.35]">
            Shop groceries, electronics, and daily essentials with Megadiscountstore's premium guarantee.
          </p>
        </div>
        <div className="absolute top-12 left-12">
          <Link to="/" className="text-[24px] font-[600] tracking-tight text-white hover:text-[#FFC220] transition-colors">
            Megadiscountstore
          </Link>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 lg:p-20 relative bg-[#FFFFFF]">
        <Link
          to="/"
          className="absolute top-8 right-8 lg:top-12 lg:right-12 flex items-center gap-2 text-[14px] font-[500] text-[#5F6368] hover:text-[#0071DC] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-[28px] font-[500] tracking-[-0.02em] text-[#1A1A1A] mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-[15px] font-[400] text-[#5F6368] leading-[1.65]">
              {isLogin ? 'Sign in to access your orders and saved items.' : 'Join to enjoy faster checkout and member benefits.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-[#F6F7F8] p-1 border border-[#E0E3E7] rounded-[8px] flex mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-[14px] font-[500] rounded-[6px] transition-all ${isLogin
                ? 'bg-[#0071DC] text-white shadow-sm'
                : 'text-[#5F6368] hover:text-[#1A1A1A] hover:bg-[#E0E3E7]/50'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-[14px] font-[500] rounded-[6px] transition-all ${!isLogin
                ? 'bg-[#0071DC] text-white shadow-sm'
                : 'text-[#5F6368] hover:text-[#1A1A1A] hover:bg-[#E0E3E7]/50'
                }`}
            >
              Sign Up
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="text-[#5F6368] text-[12px] font-[500] mb-1.5 block tracking-wide" htmlFor="fullName">Full Name</label>
                <input
                  className="h-[40px] px-3 bg-[#FFFFFF] border-[1.5px] border-[#E0E3E7] rounded-[8px] text-[14px] text-[#1A1A1A] focus:border-[#0071DC] focus:outline-none transition-colors w-full"
                  id="fullName"
                  placeholder="Enter your full name"
                  type="text"
                  onChange={handleInputChange}
                  value={formData.fullName}
                  required
                />
              </div>
            )}
            <div>
              <label className="text-[#5F6368] text-[12px] font-[500] mb-1.5 block tracking-wide" htmlFor="email">Email Address</label>
              <input
                className="h-[40px] px-3 bg-[#FFFFFF] border-[1.5px] border-[#E0E3E7] rounded-[8px] text-[14px] text-[#1A1A1A] focus:border-[#0071DC] focus:outline-none transition-colors w-full"
                id="email"
                placeholder="hello@example.com"
                type="email"
                onChange={handleInputChange}
                value={formData.email}
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[#5F6368] text-[12px] font-[500] block tracking-wide" htmlFor="password">Password</label>
                {isLogin && <a className="text-[13px] font-[400] text-[#0071DC] hover:text-[#0055A6] transition-colors" href="#">Forgot password?</a>}
              </div>
              <input
                className="h-[40px] px-3 bg-[#FFFFFF] border-[1.5px] border-[#E0E3E7] rounded-[8px] text-[14px] text-[#1A1A1A] focus:border-[#0071DC] focus:outline-none transition-colors w-full"
                id="password"
                placeholder="Enter your password"
                type="password"
                onChange={handleInputChange}
                value={formData.password}
                required
              />
            </div>
            {!isLogin && (
              <div>
                <label className="text-[#5F6368] text-[12px] font-[500] mb-1.5 block tracking-wide" htmlFor="confirmPassword">Confirm Password</label>
                <input
                  className="h-[40px] px-3 bg-[#FFFFFF] border-[1.5px] border-[#E0E3E7] rounded-[8px] text-[14px] text-[#1A1A1A] focus:border-[#0071DC] focus:outline-none transition-colors w-full"
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  type="password"
                  onChange={handleInputChange}
                  value={formData.confirmPassword}
                  required
                />
              </div>
            )}

            <button
              disabled={isLoading}
              className="w-full mt-4 h-[40px] bg-[#0071DC] hover:bg-[#0055A6] text-white rounded-[8px] font-[500] text-[14px] flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-[1px] disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-[15px] text-[#5F6368]">
            {isLogin ? "New to Megadiscountstore? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-[#0071DC] font-[500] hover:text-[#0055A6] transition-colors">
              {isLogin ? 'Create an account' : 'Sign in'}
            </button>
          </p>

          <div className="mt-12 pt-6 border-t border-[#E0E3E7] text-center">
            <p className="text-[13px] text-[#9AA0A6] font-[400] leading-[1.5]">
              By signing in, you agree to our <a className="text-[#5F6368] hover:text-[#1A1A1A] transition-colors" href="#">Terms of Service</a> & <a className="text-[#5F6368] hover:text-[#1A1A1A] transition-colors" href="#">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}