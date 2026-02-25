import heroFood from '@/assets/hero-food.jpg';
import { Link } from 'react-router-dom';
import { Sparkles, ShoppingBasket, BookOpen, ArrowRight } from 'lucide-react';

const features = [
  { icon: ShoppingBasket, title: 'Smart Pantry', desc: 'Track your ingredients with quantities and units.' },
  { icon: BookOpen, title: 'Recipe Library', desc: 'Browse and filter recipes by time and difficulty.' },
  { icon: Sparkles, title: 'AI Chef', desc: 'Generate creative recipes from what you already have.' },
];

const Index = () => {
  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
          backgroundImage: `url(${heroFood})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, hsl(142 45% 20% / 0.88), hsl(142 30% 38% / 0.72))',
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 720,
            padding: '4rem 2rem',
            margin: '0 auto',
            textAlign: 'center',
            color: '#fff',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.9rem',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 999,
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#fff',
              marginBottom: '1.5rem',
              backdropFilter: 'blur(8px)',
              letterSpacing: '0.04em',
            }}
          >
            <Sparkles size={14} />
            <span>Powered by AI</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              color: '#fff',
              marginBottom: '1.25rem',
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Cook Smart with<br />
            <span style={{ color: 'hsl(38 95% 72%)' }}>What You Have</span>
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.85)',
              maxWidth: 560,
              margin: '0 auto 2rem',
            }}
          >
            Recipe Creator recommends delicious meals based on the ingredients already in your pantry — zero food waste, maximum flavor.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.8rem 1.8rem',
                background: 'hsl(32 90% 52%)',
                color: '#fff',
                borderRadius: 'var(--radius)',
                fontSize: '1rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 20px hsl(32 90% 52% / 0.4)',
              }}
            >
              Login / Get Started
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/recipes"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.8rem 1.8rem',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.4)',
                borderRadius: 'var(--radius)',
                fontSize: '1rem',
                fontWeight: 600,
                textDecoration: 'none',
                backdropFilter: 'blur(8px)',
              }}
            >
              Browse Recipes
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 1.5rem', background: 'hsl(var(--background))' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'hsl(var(--primary))', marginBottom: '0.75rem' }}>
            How it works
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, color: 'hsl(var(--foreground))', marginBottom: '3rem', fontFamily: "'Playfair Display', serif" }}>
            From pantry to plate in minutes
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={i}
                style={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'calc(var(--radius) + 4px)',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  boxShadow: 'var(--card-shadow)',
                }}
              >
                <div style={{
                  width: 52, height: 52,
                  borderRadius: 12,
                  background: 'hsl(var(--secondary))',
                  color: 'hsl(var(--primary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  <Icon size={22} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: 'hsl(var(--foreground))' }}>{title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'hsl(var(--primary))', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: 'hsl(var(--primary-foreground))', marginBottom: '0.75rem', fontFamily: "'Playfair Display', serif" }}>
            Ready to start cooking smarter?
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
            Join thousands of home chefs who waste less and cook more.
          </p>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.85rem 2rem',
              background: 'hsl(32 90% 52%)',
              color: '#fff',
              borderRadius: 'var(--radius)',
              fontSize: '1rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Login / Get Started
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
