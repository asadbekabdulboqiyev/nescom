import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('should render with text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should render with default variant', () => {
    render(<Badge>Test</Badge>);
    const badge = screen.getByText('Test');
    expect(badge.className).toContain('bg-slate-100');
  });

  it('should render with success variant', () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText('Success');
    expect(badge.className).toContain('bg-emerald-100');
  });

  it('should render with warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText('Warning');
    expect(badge.className).toContain('bg-amber-100');
  });

  it('should render with danger variant', () => {
    render(<Badge variant="danger">Danger</Badge>);
    const badge = screen.getByText('Danger');
    expect(badge.className).toContain('bg-red-100');
  });

  it('should render with info variant', () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText('Info');
    expect(badge.className).toContain('bg-blue-100');
  });

  it('should apply custom className', () => {
    render(<Badge className="custom-class">Test</Badge>);
    const badge = screen.getByText('Test');
    expect(badge.className).toContain('custom-class');
  });
});
