import { ReactNode } from "react";

interface PageHeaderProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({
  icon,
  title,
  subtitle,
  actions,
}: PageHeaderProps) {
  return (
    <div className="relative flex flex-col items-center text-center mb-8 pb-6 border-b border-border">
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
          {icon}
        </div>
      )}
      <h1 className="text-3xl font-bold text-foreground font-serif leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
          {subtitle}
        </p>
      )}
      {actions && (
        <div className="absolute right-0 top-0 flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
