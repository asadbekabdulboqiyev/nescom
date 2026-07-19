import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('should not render when closed', () => {
    render(
      <Modal open={false} onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('should render title when provided', () => {
    render(
      <Modal open={true} onClose={() => {}} title="Test Title">
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    render(
      <Modal open={true} onClose={handleClose} title="Test">
        <p>Content</p>
      </Modal>
    );
    fireEvent.click(screen.getByLabelText('Close dialog'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    const handleClose = jest.fn();
    render(
      <Modal open={true} onClose={handleClose}>
        <p>Content</p>
      </Modal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking overlay', () => {
    const handleClose = jest.fn();
    const { container } = render(
      <Modal open={true} onClose={handleClose}>
        <p>Content</p>
      </Modal>
    );
    const overlay = container.querySelector('[role="presentation"]');
    if (overlay) {
      fireEvent.click(overlay);
    }
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should have dialog role', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
