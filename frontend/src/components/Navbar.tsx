import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChefHat,
  LayoutDashboard,
  ShoppingBasket,
  BookOpen,
  Sparkles,
  Package,
  LogIn,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pantry", label: "Pantry", icon: ShoppingBasket },
  { to: "/products", label: "Products", icon: Package },
  { to: "/recipes", label: "Recipes", icon: BookOpen },
  { to: "/generate", label: "AI Chef", icon: Sparkles },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleAuth = () => {
    if (isAuthenticated) {
      logout();
      navigate("/login");
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 no-underline shrink-0"
          >
            <ChefHat size={20} className="text-primary" />
            <span className="font-serif text-base font-bold text-foreground whitespace-nowrap hidden sm:block">
              Recipe Creator
            </span>
          </Link>

          {/* Desktop links */}
          <div className="desktop-nav-links flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors no-underline ${
                    isActive
                      ? "bg-secondary text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth button */}
          <button
            onClick={handleAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground bg-transparent hover:bg-muted transition-colors shrink-0"
          >
            {isAuthenticated ? <LogOut size={15} /> : <LogIn size={15} />}
            <span className="hidden sm:inline">
              {isAuthenticated
                ? `Logout (${user?.username || "Chef"})`
                : "Login"}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <div
        className="mobile-bottom-nav"
        style={{
          display: "none",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
        }}
      >
        <nav className="w-full bg-card border-t border-border flex justify-around items-center px-2 py-2 pb-safe">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 no-underline text-[0.6rem] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
