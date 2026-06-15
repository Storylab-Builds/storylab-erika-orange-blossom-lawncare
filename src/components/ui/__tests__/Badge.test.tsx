import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies success variant styles', () => {
    render(<Badge variant="success">Success</Badge>);
    const el = screen.getByText('Success');
    expect(el.className).toContain('bg-green-100');
    expect(el.className).toContain('text-green-700');
  });

  it('applies warning variant styles', () => {
    render(<Badge variant="warning">Warning</Badge>);
    const el = screen.getByText('Warning');
    expect(el.className).toContain('bg-amber-100');
  });

  it('applies error variant styles', () => {
    render(<Badge variant="error">Error</Badge>);
    const el = screen.getByText('Error');
    expect(el.className).toContain('bg-red-100');
  });

  it('applies neutral variant by default', () => {
    render(<Badge>Default</Badge>);
    const el = screen.getByText('Default');
    expect(el.className).toContain('bg-gray-100');
  });

  it('applies sm size by default', () => {
    render(<Badge>Small</Badge>);
    const el = screen.getByText('Small');
    expect(el.className).toContain('text-xs');
  });

  it('applies md size', () => {
    render(<Badge size="md">Medium</Badge>);
    const el = screen.getByText('Medium');
    expect(el.className).toContain('text-sm');
  });
});
