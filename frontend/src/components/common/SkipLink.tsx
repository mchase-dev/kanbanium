import type { CSSProperties } from 'react';

interface SkipLinkProps {
  href: string;
  children: string;
}

/**
 * Skip link component for keyboard accessibility
 * Allows keyboard users to skip repetitive navigation and jump to main content
 * Only visible when focused with Tab key
 */
export default function SkipLink({ href, children }: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target instanceof HTMLElement) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const style: CSSProperties = {
    position: 'absolute',
    left: '-9999px',
    top: 'auto',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    zIndex: 9999,
  };

  const focusStyle: CSSProperties = {
    position: 'fixed',
    left: '8px',
    top: '8px',
    width: 'auto',
    height: 'auto',
    overflow: 'visible',
    zIndex: 9999,
    padding: '8px 16px',
    backgroundColor: '#1677ff',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      style={style}
      onFocus={(e) => {
        Object.assign(e.currentTarget.style, focusStyle);
      }}
      onBlur={(e) => {
        Object.assign(e.currentTarget.style, style);
      }}
    >
      {children}
    </a>
  );
}

/**
 * Container for multiple skip links
 */
export function SkipLinks({ children }: { children: React.ReactNode }) {
  return (
    <nav aria-label="Skip navigation" role="navigation">
      {children}
    </nav>
  );
}
