import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default label', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render with custom label', () => {
    render(<LoadingSpinner label="Saving" />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('should apply small size class', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = screen.getByRole('status').querySelector('span[aria-hidden="true"]');
    expect(spinner?.className).toContain('h-4');
  });

  it('should apply large size class', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole('status').querySelector('span[aria-hidden="true"]');
    expect(spinner?.className).toContain('h-12');
  });

  it('should have role=status for accessibility', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render fullScreen variant', () => {
    render(<LoadingSpinner fullScreen label="Checking" />);
    expect(screen.getByText('Checking...')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<LoadingSpinner className="extra-class" />);
    const status = screen.getByRole('status');
    expect(status.className).toContain('extra-class');
  });
});
