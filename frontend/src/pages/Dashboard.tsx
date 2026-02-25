import { Link } from 'react-router-dom';
import { ShoppingBasket, BookOpen, Sparkles, ArrowRight, ChefHat, Plus } from 'lucide-react';

const cards = [
  {
    to: '/pantry',
    icon: ShoppingBasket,
    title: 'My Pantry',
    desc: 'Manage your available ingredients and quantities.',
    cta: 'Open Pantry',
    cardCls: 'bg-card border border-border',
    iconCls: 'bg-secondary text-primary',
    ctaCls: 'text-primary',
  },
  {
    to: '/recipes',
    icon: BookOpen,
    title: 'Recipes',
    desc: 'Search and filter through your recipe collection.',
    cta: 'Browse Recipes',
    cardCls: 'bg-card border border-border',
    iconCls: 'bg-amber-50 text-amber-600',
    ctaCls: 'text-amber-600',
  },
  {
    to: '/generate',
    icon: Sparkles,
    title: 'AI Generate',
    desc: 'Let AI create a recipe from your pantry items.',
    cta: 'Generate Recipe',
    cardCls: 'bg-primary border-transparent',
    iconCls: 'bg-white/20 text-white',
    ctaCls: 'text-white/90',
    dark: true,
  },
];

const quickActions = [
  { to: '/recipes/create', icon: Plus, label: 'Create new recipe' },
  { to: '/pantry', icon: ShoppingBasket, label: 'Update pantry' },
  { to: '/generate', icon: Sparkles, label: 'Generate with AI' },
];

const Dashboard = () => {
  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <ChefHat size={22} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-serif leading-tight">Welcome back, Chef!</h1>
          <p className="text-sm text-muted-foreground mt-0.5">What would you like to do today?</p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {cards.map(({ to, icon: Icon, title, desc, cta, cardCls, iconCls, ctaCls, dark }) => (
          <Link
            key={to}
            to={to}
            className={`group flex flex-col p-6 rounded-xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all no-underline ${cardCls}`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconCls}`}>
              <Icon size={22} />
            </div>
            <h2 className={`text-lg font-bold mb-1.5 ${dark ? 'text-white' : 'text-foreground'}`}>{title}</h2>
            <p className={`text-sm leading-relaxed flex-1 mb-4 ${dark ? 'text-white/75' : 'text-muted-foreground'}`}>{desc}</p>
            <div className={`flex items-center gap-1.5 text-sm font-semibold ${ctaCls}`}>
              {cta}
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-5 max-w-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
        <div className="space-y-1">
          {quickActions.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-secondary transition-colors no-underline"
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
