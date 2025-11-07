import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import EmptyState, { NoDataEmptyState, NoResultsEmptyState } from '../../components/common/EmptyState';
import { PlusOutlined, FileOutlined } from '@ant-design/icons';

describe('EmptyState', () => {
  describe('Default rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<EmptyState />);
      const emptyComponent = container.querySelector('.ant-empty');
      expect(emptyComponent).toBeInTheDocument();
    });

    it('should render with title only', () => {
      render(<EmptyState title="No items found" />);
      expect(screen.getByText('No items found')).toBeInTheDocument();
    });

    it('should render with description only', () => {
      render(<EmptyState description="Try adding some items" />);
      expect(screen.getByText('Try adding some items')).toBeInTheDocument();
    });

    it('should render with both title and description', () => {
      render(
        <EmptyState
          title="No data available"
          description="Start by creating your first item"
        />
      );
      expect(screen.getByText('No data available')).toBeInTheDocument();
      expect(screen.getByText('Start by creating your first item')).toBeInTheDocument();
    });

    it('should render with simple image by default', () => {
      const { container } = render(<EmptyState />);
      const image = container.querySelector('.ant-empty-image');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Custom icon', () => {
    it('should render with custom icon instead of default image', () => {
      render(
        <EmptyState
          title="No files"
          icon={<FileOutlined data-testid="file-icon" style={{ fontSize: 64 }} />}
        />
      );
      expect(screen.getByTestId('file-icon')).toBeInTheDocument();
    });

    it('should render icon with custom styling', () => {
      render(
        <EmptyState
          icon={
            <PlusOutlined
              data-testid="plus-icon"
              style={{ fontSize: 48, color: '#1890ff' }}
            />
          }
        />
      );
      const icon = screen.getByTestId('plus-icon');
      expect(icon).toBeInTheDocument();
      // Icon is rendered with custom styling
      expect(icon).toHaveStyle({ fontSize: '48px' });
    });
  });

  describe('Action button', () => {
    it('should render action button when provided', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          title="No items"
          action={{
            text: 'Add Item',
            onClick: handleClick,
          }}
        />
      );
      expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
    });

    it('should call onClick handler when action button is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <EmptyState
          title="No items"
          action={{
            text: 'Create New',
            onClick: handleClick,
          }}
        />
      );

      const button = screen.getByRole('button', { name: 'Create New' });
      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should render action button with icon', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          title="No items"
          action={{
            text: 'Add Item',
            onClick: handleClick,
            icon: <PlusOutlined data-testid="action-icon" />,
          }}
        />
      );
      expect(screen.getByTestId('action-icon')).toBeInTheDocument();
    });

    it('should not render action button when not provided', () => {
      render(<EmptyState title="No items" />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should render primary button for action', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          action={{
            text: 'Add Item',
            onClick: handleClick,
          }}
        />
      );
      const button = screen.getByRole('button', { name: 'Add Item' });
      expect(button).toHaveClass('ant-btn-primary');
    });
  });

  describe('ReactNode description', () => {
    it('should render ReactNode as description', () => {
      render(
        <EmptyState
          title="No data"
          description={
            <div>
              <p>Complex description with</p>
              <strong>formatted text</strong>
            </div>
          }
        />
      );
      expect(screen.getByText('Complex description with')).toBeInTheDocument();
      expect(screen.getByText('formatted text')).toBeInTheDocument();
    });

    it('should render links in description', () => {
      render(
        <EmptyState
          description={
            <div>
              Visit <a href="/help">help page</a> for more info
            </div>
          }
        />
      );
      const link = screen.getByRole('link', { name: 'help page' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/help');
    });
  });

  describe('Styling', () => {
    it('should apply title styles', () => {
      render(<EmptyState title="Custom Title" />);
      const title = screen.getByText('Custom Title');
      expect(title).toHaveStyle({
        fontSize: '16px',
        fontWeight: 500,
        color: '#262626',
      });
    });

    it('should apply description styles', () => {
      render(<EmptyState description="Custom description" />);
      const description = screen.getByText('Custom description');
      expect(description).toHaveStyle({
        color: '#8c8c8c',
        fontSize: '14px',
      });
    });
  });

  describe('Custom props pass-through', () => {
    it('should pass through additional EmptyProps', () => {
      const { container } = render(
        <EmptyState
          title="No data"
          imageStyle={{ height: 60 }}
          style={{ background: '#f0f0f0' }}
        />
      );
      const emptyComponent = container.querySelector('.ant-empty');
      expect(emptyComponent).toHaveStyle({ background: '#f0f0f0' });
    });
  });
});

describe('NoDataEmptyState', () => {
  it('should render with default message', () => {
    render(<NoDataEmptyState />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<NoDataEmptyState message="No records found" />);
    expect(screen.getByText('No records found')).toBeInTheDocument();
  });

  it('should use simple image', () => {
    const { container } = render(<NoDataEmptyState />);
    const image = container.querySelector('.ant-empty-image');
    expect(image).toBeInTheDocument();
  });

  it('should not render action button', () => {
    render(<NoDataEmptyState />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('NoResultsEmptyState', () => {
  it('should render with default title and description', () => {
    render(<NoResultsEmptyState />);
    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters or search terms')).toBeInTheDocument();
  });

  it('should render clear filters button when onClear provided', () => {
    const handleClear = vi.fn();
    render(<NoResultsEmptyState onClear={handleClear} />);
    expect(screen.getByRole('button', { name: 'Clear Filters' })).toBeInTheDocument();
  });

  it('should call onClear when button is clicked', async () => {
    const user = userEvent.setup();
    const handleClear = vi.fn();
    render(<NoResultsEmptyState onClear={handleClear} />);

    const button = screen.getByRole('button', { name: 'Clear Filters' });
    await user.click(button);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it('should not render button when onClear is not provided', () => {
    render(<NoResultsEmptyState />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render with EmptyState component', () => {
    const { container } = render(<NoResultsEmptyState />);
    const emptyComponent = container.querySelector('.ant-empty');
    expect(emptyComponent).toBeInTheDocument();
  });
});

describe('Integration scenarios', () => {
  it('should render complete empty state with all props', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="No tasks assigned"
        description="Create your first task to get started"
        icon={<PlusOutlined data-testid="icon" style={{ fontSize: 64, color: '#d9d9d9' }} />}
        action={{
          text: 'Create Task',
          onClick: handleAction,
          icon: <PlusOutlined data-testid="action-icon" />,
        }}
      />
    );

    expect(screen.getByText('No tasks assigned')).toBeInTheDocument();
    expect(screen.getByText('Create your first task to get started')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Task/i })).toBeInTheDocument();
  });

  it('should handle multiple empty states on same page', () => {
    const { container } = render(
      <div>
        <EmptyState title="No attachments" />
        <EmptyState title="No comments" />
        <EmptyState title="No watchers" />
      </div>
    );

    expect(screen.getByText('No attachments')).toBeInTheDocument();
    expect(screen.getByText('No comments')).toBeInTheDocument();
    expect(screen.getByText('No watchers')).toBeInTheDocument();

    const emptyComponents = container.querySelectorAll('.ant-empty');
    expect(emptyComponents).toHaveLength(3);
  });
});
