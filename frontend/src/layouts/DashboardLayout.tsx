import { useState, type ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Layout, Button, Dropdown, Space, Typography, Menu } from "antd";
import {
  LogoutOutlined,
  UserOutlined,
  DashboardOutlined,
  TeamOutlined,
  CheckSquareOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BlockOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useAuth } from "../contexts/AuthContext";
import { UserAvatar } from "../components/common/UserAvatar";
import SkipLink from "../components/common/SkipLink";
import MobileDrawer from "../components/common/MobileDrawer";
import ThemeToggle from "../components/common/ThemeToggle";
import { useIsMobile } from "../hooks/useIsMobile";

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const isSuperuser = user?.role === "Superuser";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "profile") {
      navigate("/profile");
    } else if (key === "logout") {
      handleLogout();
    }
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const sidebarMenuItems: MenuProps["items"] = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => handleNavigate("/dashboard"),
    },
    {
      key: "/my-tasks",
      icon: <CheckSquareOutlined />,
      label: "My Tasks",
      onClick: () => handleNavigate("/my-tasks"),
    },
    {
      key: "/activity",
      icon: <BellOutlined />,
      label: "Activity",
      onClick: () => handleNavigate("/activity"),
    },
    ...(isSuperuser
      ? [
          {
            type: "divider" as const,
          },
          {
            key: "/users",
            icon: <TeamOutlined />,
            label: "Users",
            onClick: () => handleNavigate("/users"),
          },
        ]
      : []),
  ];

  const selectedKey = location.pathname;

  // Sidebar content component (reused for desktop and mobile)
  const SidebarContent = () => (
    <>
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Link
          to="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
          }}
          onClick={() => isMobile && setMobileDrawerOpen(false)}
        >
          <BlockOutlined style={{ fontSize: 24, color: "#1677ff" }} />
          <Text strong style={{ fontSize: 18, color: "#000" }}>
            Kanbanium
          </Text>
        </Link>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={sidebarMenuItems}
        style={{ borderRight: 0 }}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <SkipLink href="#main-content">Skip to main content</SkipLink>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme="light"
          style={{
            borderRight: "1px solid #f0f0f0",
          }}
          trigger={null}
          role="navigation"
          aria-label="Main navigation"
        >
          <SidebarContent />
        </Sider>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <MobileDrawer
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
        >
          <SidebarContent />
        </MobileDrawer>
      )}

      <Layout>
        <Header
          role="banner"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
            padding: isMobile ? "0 16px" : "0 24px",
          }}
        >
          {isMobile ? (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileDrawerOpen(true)}
              style={{ fontSize: 20 }}
              aria-label="Open navigation menu"
            />
          ) : (
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16 }}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
            />
          )}

          <Space size="middle">
            <ThemeToggle />
            {user && (
              <>
                <Text>
                  {user.firstName} {user.lastName}
                </Text>

                <Dropdown
                  menu={{ items: userMenuItems, onClick: handleMenuClick }}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    icon={<UserAvatar user={user} size="small" />}
                    aria-label="User menu"
                    aria-haspopup="true"
                  />
                </Dropdown>
              </>
            )}
          </Space>
        </Header>

        <Content
          id="main-content"
          role="main"
          aria-label="Main content"
          tabIndex={-1}
          style={{
            padding: isMobile ? "16px" : "24px",
            maxWidth: 1400,
            width: "100%",
            margin: "0 auto",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
