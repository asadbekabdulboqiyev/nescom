import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../Header';
import { useAuth } from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  return MockLink;
});

jest.mock('../NotificationBell', () => ({
  NotificationBell: () => <div data-testid="notification-bell" />,
}));

jest.mock('../Avatar', () => ({
  Avatar: () => <div data-testid="avatar" />,
}));

const mockedUseAuth = useAuth as jest.Mock;
const mockLogout = jest.fn().mockResolvedValue(undefined);

const mockUser = {
  id: 'user-1',
  name: 'Asadbek',
  email: 'asadbek@example.com',
  role: 'MANAGER',
  companyId: 'company-1',
};

describe('Header', () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({ user: mockUser, logout: mockLogout });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render user name', () => {
    render(<Header />);
    expect(screen.getByText('Asadbek')).toBeInTheDocument();
  });

  it('should render role label with normalized formatting', () => {
    render(<Header />);
    expect(screen.getByText('MANAGER')).toBeInTheDocument();
  });

  it('should render search input', () => {
    render(<Header />);
    expect(screen.getByLabelText('Search employees and tasks')).toBeInTheDocument();
  });

  it('should render notification bell', () => {
    render(<Header />);
    expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
  });

  it('should call onMenuToggle when menu button clicked', () => {
    const onMenuToggle = jest.fn();
    render(<Header onMenuToggle={onMenuToggle} />);
    fireEvent.click(screen.getByLabelText('Open navigation menu'));
    expect(onMenuToggle).toHaveBeenCalled();
  });

  it('should open user menu on click', () => {
    render(<Header />);
    fireEvent.click(screen.getByLabelText('User menu'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('should show Profile and Settings links in user menu', () => {
    render(<Header />);
    fireEvent.click(screen.getByLabelText('User menu'));
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should logout when Sign out clicked', async () => {
    render(<Header />);
    fireEvent.click(screen.getByLabelText('User menu'));
    fireEvent.click(screen.getByText('Sign out'));
    expect(mockLogout).toHaveBeenCalled();
  });

  it('should show fallback text when user is null', () => {
    mockedUseAuth.mockReturnValue({ user: null, logout: mockLogout });
    render(<Header />);
    expect(screen.getAllByText('Member').length).toBeGreaterThan(0);
  });
});
