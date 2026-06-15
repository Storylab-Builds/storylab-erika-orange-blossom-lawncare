import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatsCard from '../StatsCard';

describe('StatsCard', () => {
  it('renders title and value', () => {
    render(<StatsCard title="Revenue" value="$5,000" />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });

  it('renders numeric value', () => {
    render(<StatsCard title="Jobs" value={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders upward trend', () => {
    render(<StatsCard title="Revenue" value="$5,000" trend={12} trendDirection="up" />);
    expect(screen.getByText('12%')).toBeInTheDocument();
    expect(screen.getByText('vs last week')).toBeInTheDocument();
  });

  it('renders downward trend', () => {
    render(<StatsCard title="Cancels" value={3} trend={5} trendDirection="down" />);
    expect(screen.getByText('5%')).toBeInTheDocument();
  });

  it('does not render trend section when trend is undefined', () => {
    render(<StatsCard title="Jobs" value={10} />);
    expect(screen.queryByText('vs last week')).not.toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<StatsCard title="Test" value={0} icon={<span data-testid="icon">I</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
