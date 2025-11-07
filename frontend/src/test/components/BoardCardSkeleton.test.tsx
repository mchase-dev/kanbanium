import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BoardCardSkeleton from '../../components/board/BoardCardSkeleton';

describe('BoardCardSkeleton', () => {
  it('should render card skeleton', () => {
    const { container } = render(<BoardCardSkeleton />);
    const card = container.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('should render skeleton elements', () => {
    const { container } = render(<BoardCardSkeleton />);
    const skeletons = container.querySelectorAll('.ant-skeleton-element');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render active skeletons', () => {
    const { container } = render(<BoardCardSkeleton />);
    const activeElements = container.querySelectorAll('.ant-skeleton-active, .ant-skeleton-element-active');
    expect(activeElements.length).toBeGreaterThan(0);
  });

  it('should render board title skeleton', () => {
    const { container } = render(<BoardCardSkeleton />);
    const titleSkeleton = container.querySelector('.ant-skeleton-input');
    expect(titleSkeleton).toBeInTheDocument();
  });

  it('should render board description skeleton', () => {
    const { container } = render(<BoardCardSkeleton />);
    const paragraphSkeleton = container.querySelector('.ant-skeleton');
    expect(paragraphSkeleton).toBeInTheDocument();
  });

  it('should render stats section skeleton', () => {
    const { container } = render(<BoardCardSkeleton />);
    const inputSkeletons = container.querySelectorAll('.ant-skeleton-input');
    // Should have title + 2 stats inputs
    expect(inputSkeletons.length).toBeGreaterThanOrEqual(2);
  });

  it('should use Space component for layout', () => {
    const { container } = render(<BoardCardSkeleton />);
    const space = container.querySelector('.ant-space');
    expect(space).toBeInTheDocument();
  });
});
