import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from '../Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card><p>Card content</p></Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies default padding (md = p-5)', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstElementChild!.className).toContain('p-5');
  });

  it('applies sm padding', () => {
    const { container } = render(<Card padding="sm">Content</Card>);
    expect(container.firstElementChild!.className).toContain('p-3');
  });

  it('applies lg padding', () => {
    const { container } = render(<Card padding="lg">Content</Card>);
    expect(container.firstElementChild!.className).toContain('p-7');
  });

  it('applies hover styles when hover=true', () => {
    const { container } = render(<Card hover>Content</Card>);
    expect(container.firstElementChild!.className).toContain('hover:shadow-lg');
  });

  it('does not apply hover styles by default', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstElementChild!.className).not.toContain('hover:shadow-lg');
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="mt-4">Content</Card>);
    expect(container.firstElementChild!.className).toContain('mt-4');
  });
});
