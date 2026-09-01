import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Users } from 'lucide-react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('should render title', () => {
    render(<EmptyState title="No tasks found" />);
    expect(screen.getByText('No tasks found')).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    render(<EmptyState title="No tasks" description="Create your first task" />);
    expect(screen.getByText('Create your first task')).toBeInTheDocument();
  });

  it('should not render description when absent', () => {
    render(<EmptyState title="No tasks" />);
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('should render action node when provided', () => {
    render(<EmptyState title="No tasks" action={<button>Create Task</button>} />);
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  it('should use custom icon', () => {
    render(<EmptyState title="No users" icon={Users} />);
    // lucide icons render as svg
    expect(screen.getByRole('status').querySelector('svg')).toBeInTheDocument();
  });

  it('should have role=status for accessibility', () => {
    render(<EmptyState title="Empty" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should apply compact class when compact prop is set', () => {
    render(<EmptyState title="Empty" compact />);
    const status = screen.getByRole('status');
    expect(status.className).toContain('py-8');
  });

  it('should apply custom className', () => {
    render(<EmptyState title="Empty" className="custom-cls" />);
    expect(screen.getByRole('status').className).toContain('custom-cls');
  });
});
