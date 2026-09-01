import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { AuthGuard } from '../AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;

const mockUser = {
  id: 'user-1',
  name: 'Asadbek',
  email: 'asadbek@example.com',
  role: 'MANAGER' as const,
  companyId: 'company-1',
};

describe('AuthGuard', () => {
  beforeEach(() => {
    mockedUseRouter.mockReturnValue({ replace: jest.fn() });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading spinner while checking auth', () => {
    mockedUseAuth.mockReturnValue({ user: null, loading: true });
    render(<AuthGuard>Content</AuthGuard>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render children when user is authenticated', () => {
    mockedUseAuth.mockReturnValue({ user: mockUser, loading: false });
    render(<AuthGuard>Dashboard content</AuthGuard>);
    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    const replace = jest.fn();
    mockedUseRouter.mockReturnValue({ replace });
    mockedUseAuth.mockReturnValue({ user: null, loading: false });
    render(<AuthGuard>Secret</AuthGuard>);
    expect(replace).toHaveBeenCalledWith('/login');
  });

  it('should show login prompt when not authenticated', () => {
    mockedUseAuth.mockReturnValue({ user: null, loading: false });
    render(<AuthGuard>Secret</AuthGuard>);
    expect(screen.getByText(/You are not signed in/i)).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    mockedUseAuth.mockReturnValue({ user: null, loading: false });
    render(<AuthGuard fallback={<div>Custom Fallback</div>}>Secret</AuthGuard>);
    expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
  });

  it('should block users without required role', () => {
    mockedUseAuth.mockReturnValue({
      user: { ...mockUser, role: 'DEVELOPER' },
      loading: false,
    });
    render(<AuthGuard requiredRole="CEO">Admin content</AuthGuard>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
  });

  it('should allow users with matching role in array', () => {
    mockedUseAuth.mockReturnValue({
      user: { ...mockUser, role: 'MANAGER' },
      loading: false,
    });
    render(<AuthGuard requiredRole={['CEO', 'MANAGER']}>Manager content</AuthGuard>);
    expect(screen.getByText('Manager content')).toBeInTheDocument();
  });

  it('should render children when role matches exactly', () => {
    mockedUseAuth.mockReturnValue({
      user: { ...mockUser, role: 'CEO' },
      loading: false,
    });
    render(<AuthGuard requiredRole="CEO">CEO content</AuthGuard>);
    expect(screen.getByText('CEO content')).toBeInTheDocument();
  });
});
