import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  BulbOutlined,
  BulbFilled,
  DesktopOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  showText?: boolean;
  size?: 'small' | 'middle' | 'large';
}

export default function ThemeToggle({ showText = false, size = 'middle' }: ThemeToggleProps) {
  const { theme, actualTheme, setTheme } = useTheme();

  const menuItems: MenuProps['items'] = [
    {
      key: 'light',
      icon: <BulbOutlined />,
      label: (
        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 120 }}>
          <span>Light</span>
          {theme === 'light' && <CheckOutlined style={{ marginLeft: 8 }} />}
        </span>
      ),
      onClick: () => setTheme('light'),
    },
    {
      key: 'dark',
      icon: <BulbFilled />,
      label: (
        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 120 }}>
          <span>Dark</span>
          {theme === 'dark' && <CheckOutlined style={{ marginLeft: 8 }} />}
        </span>
      ),
      onClick: () => setTheme('dark'),
    },
    {
      key: 'system',
      icon: <DesktopOutlined />,
      label: (
        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 120 }}>
          <span>System</span>
          {theme === 'system' && <CheckOutlined style={{ marginLeft: 8 }} />}
        </span>
      ),
      onClick: () => setTheme('system'),
    },
  ];

  const getIcon = () => {
    if (actualTheme === 'dark') {
      return <BulbFilled />;
    }
    return <BulbOutlined />;
  };

  const getLabel = () => {
    if (!showText) return null;

    if (theme === 'system') {
      return `Theme (${actualTheme === 'dark' ? 'Dark' : 'Light'})`;
    }
    return theme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button
        type="text"
        icon={getIcon()}
        size={size}
        aria-label="Toggle theme"
      >
        {getLabel()}
      </Button>
    </Dropdown>
  );
}
