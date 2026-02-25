import { Link } from "react-router-dom";
import {
  ShoppingBasket,
  BookOpen,
  Sparkles,
  ArrowRight,
  ChefHat,
  Package,
} from "lucide-react";

const featureCards = [
  {
    to: "/pantry",
    icon: ShoppingBasket,
    title: "My Pantry",
    desc: "Manage your available ingredients and quantities.",
    cta: "Open Pantry",
    iconCls: "bg-secondary text-primary",
    ctaCls: "text-primary",
  },
  {
    to: "/products",
    icon: Package,
    title: "Products",
    desc: "Browse and manage the full ingredient catalog.",
    cta: "Manage Products",
    iconCls: "bg-secondary text-primary",
    ctaCls: "text-primary",
  },
  {
    to: "/recipes",
    icon: BookOpen,
    title: "Recipes",
    desc: "Search and filter through your recipe collection.",
    cta: "Browse Recipes",
    iconCls: "bg-amber-50 text-amber-600",
    ctaCls: "text-amber-600",
  },
];

const quickActions = [
  { to: "/pantry", icon: ShoppingBasket, label: "Update pantry" },
  { to: "/products", icon: Package, label: "Manage products" },
  { to: "/generate", icon: Sparkles, label: "Generate with AI" },
];

const Dashboard = () => {
  return (
    <div className="page-wrapper">
      {/* Centered Welcome Header */}
      <div className="flex flex-col items-center text-center mb-8 pb-6 border-b border-border">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
          <ChefHat size={24} />
        </div>
        <h1 className="text-3xl font-bold text-foreground font-serif leading-tight">
          Welcome back, Chef!
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          What would you like to cook today?
        </p>
      </div>

      {/* 3 Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
        {featureCards.map(
          ({ to, icon: Icon, title, desc, cta, iconCls, ctaCls }) => (
            <Link
              key={to}
              to={to}
              className="group flex flex-col p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all no-underline"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconCls}`}
              >
                <Icon size={22} />
              </div>
              <h2 className="text-lg font-bold mb-1.5 text-foreground">
                {title}
              </h2>
              <p className="text-sm leading-relaxed flex-1 mb-4 text-muted-foreground">
                {desc}
              </p>
              <div
                className={`flex items-center gap-1.5 text-sm font-semibold ${ctaCls}`}
              >
                {cta}
                <ArrowRight
                  size={15}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </div>
            </Link>
          ),
        )}
      </div>

      {/* AI Generate — Full-width Hero Card */}
      <Link
        to="/generate"
        className="group flex items-center justify-between gap-6 p-6 rounded-xl bg-primary border-transparent shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all no-underline mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-0.5">AI Generate</h2>
            <p className="text-sm text-white/75">
              Let AI create a recipe from your pantry items — instantly.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-white/90 shrink-0">
          Generate Recipe
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </div>
      </Link>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-2">
          {quickActions.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-muted-foreground bg-muted hover:text-primary hover:bg-secondary transition-colors no-underline border border-border"
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
