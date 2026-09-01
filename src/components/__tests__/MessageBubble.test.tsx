import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MessageBubble } from '../MessageBubble';

jest.mock('../Avatar', () => ({
  Avatar: () => <div data-testid="avatar" />,
}));

describe('MessageBubble', () => {
  const sender = { name: 'Ali', avatar: null };

  it('should render message text', () => {
    render(<MessageBubble sender={sender} text="Hello world" time="10:30" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('should render sender name for incoming messages', () => {
    render(<MessageBubble sender={sender} text="Hi" time="10:30" />);
    expect(screen.getByText('Ali')).toBeInTheDocument();
  });

  it('should hide sender name for own messages', () => {
    render(<MessageBubble sender={sender} text="Hi" time="10:30" isOwn />);
    expect(screen.queryByText('Ali')).not.toBeInTheDocument();
  });

  it('should render time', () => {
    render(<MessageBubble sender={sender} text="Hi" time="10:30" />);
    expect(screen.getByText('10:30')).toBeInTheDocument();
  });

  it('should use blue style for own messages', () => {
    render(<MessageBubble sender={sender} text="Hi" time="10:30" isOwn />);
    const bubble = screen.getByText('Hi');
    expect(bubble.className).toContain('bg-blue-600');
  });

  it('should use slate style for incoming messages', () => {
    render(<MessageBubble sender={sender} text="Hi" time="10:30" />);
    const bubble = screen.getByText('Hi');
    expect(bubble.className).toContain('bg-slate-100');
  });

  it('should have article role with aria-label', () => {
    render(<MessageBubble sender={sender} text="Hi" time="10:30" />);
    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('aria-label', expect.stringContaining('Ali'));
  });
});
