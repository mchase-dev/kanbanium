import { Empty, Button } from 'antd';
import type { EmptyProps } from 'antd';
import type { ReactNode } from 'react';

interface EmptyStateProps extends EmptyProps {
  title?: string;
  description?: string | ReactNode;
  action?: {
    text: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  icon?: ReactNode;
}

/**
 * Reusable empty state component with consistent styling and optional actions
 */
export default function EmptyState({
  title,
  description,
  action,
  icon,
  image = Empty.PRESENTED_IMAGE_SIMPLE,
  ...props
}: EmptyStateProps) {
  return (
    <Empty
      image={icon || image}
      description={
        <div>
          {title && (
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8, color: '#262626' }}>
              {title}
            </div>
          )}
          {description && (
            <div style={{ color: '#8c8c8c', fontSize: 14 }}>
              {description}
            </div>
          )}
        </div>
      }
      {...props}
    >
      {action && (
        <Button
          type="primary"
          icon={action.icon}
          onClick={action.onClick}
          style={{ marginTop: 16 }}
        >
          {action.text}
        </Button>
      )}
    </Empty>
  );
}

/**
 * Empty state with default "no data" message
 */
export function NoDataEmptyState({ message = 'No data available' }: { message?: string }) {
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={message} />;
}

/**
 * Empty state for filtered results
 */
export function NoResultsEmptyState({
  onClear,
}: {
  onClear?: () => void;
}) {
  return (
    <EmptyState
      title="No results found"
      description="Try adjusting your filters or search terms"
      action={
        onClear
          ? {
              text: 'Clear Filters',
              onClick: onClear,
            }
          : undefined
      }
    />
  );
}
