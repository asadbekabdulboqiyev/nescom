import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should render with primary variant by default', () => {
    render(<Button>Test</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-blue-600');
  });

  it('should render with secondary variant', () => {
    render(<Button variant="secondary">Test</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-slate-100');
  });

  it('should render with danger variant', () => {
    render(<Button variant="danger">Test</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-red-600');
  });

  it('should render with outline variant', () => {
    render(<Button variant="outline">Test</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('border');
  });

  it('should render with ghost variant', () => {
    render(<Button variant="ghost">Test</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('text-slate-600');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should be disabled when loading', () => {
    render(<Button loading>Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should call onClick handler', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Click
      </Button>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render with sm size', () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('text-xs');
  });

  it('should render with lg size', () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('text-base');
  });
});
