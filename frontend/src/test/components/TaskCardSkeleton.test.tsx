import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TaskCardSkeleton from '../../components/task/TaskCardSkeleton';

describe('TaskCardSkeleton', () => {
  it('should render card skeleton', () => {
    const { container } = render(<TaskCardSkeleton />);
    const card = container.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('should render small card size', () => {
    const { container } = render(<TaskCardSkeleton />);
    const card = container.querySelector('.ant-card-small');
    expect(card).toBeInTheDocument();
  });

  it('should render skeleton elements', () => {
    const { container } = render(<TaskCardSkeleton />);
    const skeletons = container.querySelectorAll('.ant-skeleton-element');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render active skeletons', () => {
    const { container } = render(<TaskCardSkeleton />);
    const activeElements = container.querySelectorAll('.ant-skeleton-active, .ant-skeleton-element-active');
    expect(activeElements.length).toBeGreaterThan(0);
  });

  it('should render task title skeleton', () => {
    const { container } = render(<TaskCardSkeleton />);
    const inputSkeletons = container.querySelectorAll('.ant-skeleton-input');
    expect(inputSkeletons.length).toBeGreaterThan(0);
  });

  it('should render priority and label skeletons', () => {
    const { container } = render(<TaskCardSkeleton />);
    const buttonSkeletons = container.querySelectorAll('.ant-skeleton-button');
    expect(buttonSkeletons.length).toBeGreaterThanOrEqual(2);
  });

  it('should render assignee avatar skeleton', () => {
    const { container } = render(<TaskCardSkeleton />);
    const avatarSkeleton = container.querySelector('.ant-skeleton-avatar');
    expect(avatarSkeleton).toBeInTheDocument();
  });

  it('should use Space component for layout', () => {
    const { container } = render(<TaskCardSkeleton />);
    const space = container.querySelector('.ant-space');
    expect(space).toBeInTheDocument();
  });

  it('should have vertical space direction', () => {
    const { container } = render(<TaskCardSkeleton />);
    const space = container.querySelector('.ant-space-vertical');
    expect(space).toBeInTheDocument();
  });
});
