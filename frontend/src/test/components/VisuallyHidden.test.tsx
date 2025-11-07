import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VisuallyHidden from '../../components/common/VisuallyHidden';

describe('VisuallyHidden', () => {
  it('should render children', () => {
    render(<VisuallyHidden>Hidden text</VisuallyHidden>);
    expect(screen.getByText('Hidden text')).toBeInTheDocument();
  });

  it('should render as span by default', () => {
    const { container } = render(<VisuallyHidden>Hidden text</VisuallyHidden>);
    const element = container.querySelector('span');
    expect(element).toBeInTheDocument();
    expect(element?.textContent).toBe('Hidden text');
  });

  it('should render as custom element when specified', () => {
    const { container } = render(<VisuallyHidden as="div">Hidden text</VisuallyHidden>);
    const element = container.querySelector('div');
    expect(element).toBeInTheDocument();
    expect(element?.textContent).toBe('Hidden text');
  });

  it('should apply visually hidden styles', () => {
    const { container } = render(<VisuallyHidden>Hidden text</VisuallyHidden>);
    const element = container.querySelector('span');

    // Test critical styles that make element visually hidden
    expect(element).toHaveStyle({
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0px',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0px, 0px, 0px, 0px)',
    });
  });

  it('should be accessible to screen readers', () => {
    render(<VisuallyHidden>Screen reader text</VisuallyHidden>);
    const element = screen.getByText('Screen reader text');
    expect(element).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    render(
      <VisuallyHidden>
        <span>First</span>
        <span>Second</span>
      </VisuallyHidden>
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('should allow focusable elements when focusable prop is true', () => {
    const { container } = render(
      <VisuallyHidden focusable>
        <button>Focus me</button>
      </VisuallyHidden>
    );
    const element = container.querySelector('span');
    expect(element).toHaveStyle({ clipPath: 'none' });
  });

  it('should hide from visual users but not screen readers', () => {
    render(<VisuallyHidden>Important announcement</VisuallyHidden>);
    const element = screen.getByText('Important announcement');

    // Element exists in DOM
    expect(element).toBeInTheDocument();

    // But is visually hidden
    expect(element).toHaveStyle({
      position: 'absolute',
      width: '1px',
      height: '1px',
    });
  });

  it('should render as paragraph when specified', () => {
    const { container } = render(<VisuallyHidden as="p">Paragraph text</VisuallyHidden>);
    const element = container.querySelector('p');
    expect(element).toBeInTheDocument();
  });

  it('should render with nested elements', () => {
    render(
      <VisuallyHidden>
        <div>
          <strong>Bold text</strong> and normal text
        </div>
      </VisuallyHidden>
    );
    expect(screen.getByText(/Bold text/)).toBeInTheDocument();
    expect(screen.getByText(/and normal text/)).toBeInTheDocument();
  });
});
