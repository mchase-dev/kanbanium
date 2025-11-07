import { Drawer } from 'antd';
import type { ReactNode } from 'react';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  placement?: 'left' | 'right' | 'top' | 'bottom';
}

/**
 * Mobile-optimized drawer component
 * Full-width drawer for mobile devices with swipe-to-close support
 */
export default function MobileDrawer({
  open,
  onClose,
  children,
  title,
  placement = 'left',
}: MobileDrawerProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement={placement}
      title={title}
      width="85%"
      styles={{
        body: { padding: 0 },
      }}
      closeIcon={null}
      // Mobile-friendly props
      maskClosable={true}
      keyboard={true}
    >
      {children}
    </Drawer>
  );
}
