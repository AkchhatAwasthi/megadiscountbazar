import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-light)] font-inter px-6">
      <div className="text-center max-w-md bg-white p-10 md:p-12 rounded-[16px] border border-[var(--border-default)] shadow-[0_8px_24px_rgba(0,0,0,0.04)] animate-in fade-in zoom-in-95 duration-400">
        <h1 className="text-[64px] md:text-[80px] font-[600] text-[var(--blue-primary)] leading-none tracking-tight mb-4">404</h1>
        <h2 className="text-[24px] md:text-[28px] font-[600] text-[var(--text-primary)] mb-3 tracking-tight">Oops! Page not found</h2>
        <p className="text-[15px] text-[var(--text-secondary)] mb-8 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <a 
          href="/" 
          className="inline-flex items-center justify-center bg-[var(--blue-primary)] text-white h-12 px-8 rounded-[8px] font-[500] text-[15px] hover:bg-[var(--blue-deep)] hover:-translate-y-[1px] transition-all duration-200 shadow-sm active:scale-[0.98]"
        >
          Return to Homepage
        </a>
      </div>
    </div>
  );
};

export default NotFound;
