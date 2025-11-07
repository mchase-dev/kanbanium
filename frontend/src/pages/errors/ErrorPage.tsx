import { Button, Result } from 'antd';
import { useNavigate, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

/**
 * Generic error page component for React Router error boundaries
 */
export default function ErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError();

  let title = 'Something went wrong';
  let subtitle = 'An unexpected error occurred. Please try again later.';
  let status: 403 | 404 | 500 | 'error' = 'error';

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      status = 404;
      title = '404 - Page Not Found';
      subtitle = 'Sorry, the page you visited does not exist.';
    } else if (error.status === 403) {
      status = 403;
      title = '403 - Forbidden';
      subtitle = "You don't have permission to access this resource.";
    } else if (error.status === 500) {
      status = 500;
      title = '500 - Server Error';
      subtitle = 'Something went wrong on our end. Please try again later.';
    } else {
      title = `${error.status} - ${error.statusText}`;
      subtitle = error.data?.message || subtitle;
    }
  } else if (error instanceof Error) {
    subtitle = import.meta.env.DEV ? error.message : subtitle;
  }

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px',
      }}
    >
      <Result
        status={status}
        title={title}
        subTitle={subtitle}
        extra={[
          <Button type="primary" key="home" icon={<HomeOutlined />} onClick={handleGoHome}>
            Go to Dashboard
          </Button>,
          <Button key="refresh" onClick={handleRefresh}>
            Refresh Page
          </Button>,
        ]}
      />
    </div>
  );
}
