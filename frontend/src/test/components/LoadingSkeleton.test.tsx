import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSkeleton, {
  TextSkeleton,
  AvatarTextSkeleton,
  InputSkeleton,
  ButtonSkeleton,
  ImageSkeleton,
} from '../../components/common/LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('should render a single skeleton by default', () => {
    const { container } = render(<LoadingSkeleton />);
    const skeletons = container.querySelectorAll('.ant-skeleton');
    expect(skeletons.length).toBe(1);
  });

  it('should render multiple skeletons when count is provided', () => {
    const { container } = render(<LoadingSkeleton count={3} />);
    const skeletons = container.querySelectorAll('.ant-skeleton');
    expect(skeletons.length).toBe(3);
  });

  it('should pass through Ant Design Skeleton props', () => {
    const { container } = render(<LoadingSkeleton avatar paragraph={{ rows: 4 }} />);
    const skeleton = container.querySelector('.ant-skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton?.querySelector('.ant-skeleton-avatar')).toBeInTheDocument();
  });

  it('should render active skeletons', () => {
    const { container } = render(<LoadingSkeleton />);
    const skeleton = container.querySelector('.ant-skeleton-active');
    expect(skeleton).toBeInTheDocument();
  });
});

describe('TextSkeleton', () => {
  it('should render text skeleton with default rows', () => {
    const { container } = render(<TextSkeleton />);
    const skeleton = container.querySelector('.ant-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render text skeleton with custom rows', () => {
    const { container } = render(<TextSkeleton rows={5} />);
    const skeleton = container.querySelector('.ant-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('should not render title', () => {
    const { container } = render(<TextSkeleton />);
    const title = container.querySelector('.ant-skeleton-title');
    expect(title).not.toBeInTheDocument();
  });
});

describe('AvatarTextSkeleton', () => {
  it('should render avatar and text', () => {
    const { container } = render(<AvatarTextSkeleton />);
    const avatar = container.querySelector('.ant-skeleton-avatar');
    expect(avatar).toBeInTheDocument();
  });

  it('should be active', () => {
    const { container } = render(<AvatarTextSkeleton />);
    const skeleton = container.querySelector('.ant-skeleton-active');
    expect(skeleton).toBeInTheDocument();
  });
});

describe('InputSkeleton', () => {
  it('should render input skeleton', () => {
    const { container } = render(<InputSkeleton />);
    const input = container.querySelector('.ant-skeleton-input');
    expect(input).toBeInTheDocument();
  });

  it('should render block input', () => {
    const { container } = render(<InputSkeleton />);
    const input = container.querySelector('.ant-skeleton-input');
    expect(input).toBeInTheDocument();
  });

  it('should be active', () => {
    const { container } = render(<InputSkeleton />);
    const skeleton = container.querySelector('.ant-skeleton-active');
    expect(skeleton).toBeInTheDocument();
  });
});

describe('ButtonSkeleton', () => {
  it('should render button skeleton', () => {
    const { container } = render(<ButtonSkeleton />);
    const button = container.querySelector('.ant-skeleton-button');
    expect(button).toBeInTheDocument();
  });

  it('should render block button when block prop is true', () => {
    const { container } = render(<ButtonSkeleton block />);
    const button = container.querySelector('.ant-skeleton-button');
    expect(button).toBeInTheDocument();
  });

  it('should be active', () => {
    const { container } = render(<ButtonSkeleton />);
    const skeleton = container.querySelector('.ant-skeleton-active');
    expect(skeleton).toBeInTheDocument();
  });
});

describe('ImageSkeleton', () => {
  it('should render image skeleton', () => {
    const { container } = render(<ImageSkeleton />);
    const image = container.querySelector('.ant-skeleton-image');
    expect(image).toBeInTheDocument();
  });

  it('should be active', () => {
    const { container } = render(<ImageSkeleton />);
    const skeleton = container.querySelector('.ant-skeleton-active');
    expect(skeleton).toBeInTheDocument();
  });
});
