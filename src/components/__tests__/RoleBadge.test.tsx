import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { RoleBadge } from '../RoleBadge';

describe('RoleBadge', () => {
  it('should render CEO role with label', () => {
    render(<RoleBadge role="CEO" />);
    expect(screen.getByText('CEO')).toBeInTheDocument();
  });

  it('should render PENDING role', () => {
    render(<RoleBadge role="PENDING" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should render Manager role with label', () => {
    render(<RoleBadge role="MANAGER" />);
    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  it('should render badge with rounded classes from config', () => {
    render(<RoleBadge role="MANAGER" />);
    const badge = screen.getByText('Manager');
    expect(badge.className).toContain('rounded-full');
    expect(badge.className).toContain('bg-blue');
  });

  it('should apply custom className', () => {
    render(<RoleBadge role="DEVELOPER" className="custom-x" />);
    expect(screen.getByText('Developer').className).toContain('custom-x');
  });

  it('should render icon for role with known icon', () => {
    render(<RoleBadge role="CEO" />);
    const badge = screen.getByText('CEO');
    expect(badge.querySelector('svg')).toBeInTheDocument();
  });
});
