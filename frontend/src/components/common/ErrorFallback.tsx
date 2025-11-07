import { Button, Result } from 'antd';
import { FrownOutlined } from '@ant-design/icons';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

/**
 * Error fallback UI component displayed when ErrorBoundary catches an error
 */
export default function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const handleRefresh = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.href = '/';
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
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
        status="error"
        icon={<FrownOutlined />}
        title="Oops! Something went wrong"
        subTitle={
          <>
            <p>We encountered an unexpected error. Don't worry, your data is safe.</p>
            {import.meta.env.DEV && error && (
              <details style={{ marginTop: '16px', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                  Error details (development only)
                </summary>
                <pre
                  style={{
                    padding: '12px',
                    background: '#f5f5f5',
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '12px',
                  }}
                >
                  <code>
                    {error.name}: {error.message}
                    {'\n\n'}
                    {error.stack}
                  </code>
                </pre>
              </details>
            )}
          </>
        }
        extra={[
          <Button type="primary" key="retry" onClick={handleRefresh}>
            Try Again
          </Button>,
          <Button key="home" onClick={handleGoHome}>
            Go to Dashboard
          </Button>,
        ]}
      />
    </div>
  );
}
