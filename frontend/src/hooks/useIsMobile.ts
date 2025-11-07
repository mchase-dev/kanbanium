import { useMediaQuery } from './useMediaQuery';

/**
 * Hook to detect if the current viewport is mobile (360px or larger, but less than 768px)
 * This aligns with the user's requirement for minimum screen width of 360px
 *
 * @returns boolean indicating if the device is mobile
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/**
 * Hook to detect if the current viewport is tablet
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

/**
 * Hook to detect if the current viewport is desktop
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

/**
 * Hook to detect touch device capability
 */
export function useIsTouchDevice(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Combined hook that returns an object with all viewport information
 */
export function useViewport() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const isTouchDevice = useIsTouchDevice();

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    // Convenience flags
    isSmallScreen: isMobile,
    isMediumScreen: isTablet,
    isLargeScreen: isDesktop,
  };
}
