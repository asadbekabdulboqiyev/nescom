import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { StatsCard } from '../StatsCard';
import { Users } from 'lucide-react';

describe('StatsCard', () => {
  it('should render title and value', () => {
    render(
      <StatsCard title="Total Employees" value={42} icon={Users} />
    );
    expect(screen.getByText('Total Employees')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render string value', () => {
    render(
      <StatsCard title="Revenue" value="$1.2M" icon={Users} />
    );
    expect(screen.getByText('$1.2M')).toBeInTheDocument();
  });

  it('should render change text when provided', () => {
    render(
      <StatsCard
        title="Users"
        value={100}
        change="+12%"
        changeType="positive"
        icon={Users}
      />
    );
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('should apply positive change color', () => {
    render(
      <StatsCard
        title="Users"
        value={100}
        change="+12%"
        changeType="positive"
        icon={Users}
      />
    );
    const change = screen.getByText('+12%');
    expect(change.className).toContain('text-emerald-600');
  });

  it('should apply negative change color', () => {
    render(
      <StatsCard
        title="Users"
        value={100}
        change="-5%"
        changeType="negative"
        icon={Users}
      />
    );
    const change = screen.getByText('-5%');
    expect(change.className).toContain('text-red-600');
  });

  it('should have proper aria-label', () => {
    render(
      <StatsCard title="Employees" value={25} icon={Users} />
    );
    expect(screen.getByRole('region')).toHaveAttribute(
      'aria-label',
      'Employees: 25'
    );
  });
});
