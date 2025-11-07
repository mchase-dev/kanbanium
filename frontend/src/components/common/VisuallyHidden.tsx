import type { ReactNode, CSSProperties, ElementType, HTMLAttributes } from 'react';

interface VisuallyHiddenProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: ElementType;
  focusable?: boolean;
}

/**
 * Component that visually hides content but keeps it accessible to screen readers
 * Uses CSS to hide content off-screen while maintaining accessibility
 */
export default function VisuallyHidden({
  children,
  as: Component = 'span',
  focusable = false,
  ...rest
}: VisuallyHiddenProps) {
  const style: CSSProperties = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
    ...(focusable && {
      // Allow focus if focusable prop is true
      clipPath: 'none',
    }),
  };

  return <Component style={style} {...rest}>{children}</Component>;
}

/**
 * Hook to conditionally render content as visually hidden
 */
export function useVisuallyHidden(condition: boolean) {
  return condition ? VisuallyHidden : 'span';
}
