import type React from 'react';

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Link({ href, children, className = '', onClick }: LinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isPrimaryButton = e.button === 0;
    const hasModifier = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;

    if (!isPrimaryButton || hasModifier) return;

    e.preventDefault();
    onClick?.();
    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
