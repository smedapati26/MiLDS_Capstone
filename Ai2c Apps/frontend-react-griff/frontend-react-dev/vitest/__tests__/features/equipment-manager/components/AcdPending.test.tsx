import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import AcdPending from '@features/equipment-manager/components/AcdPending';

describe('AcdPending', () => {
  it('renders default pending message', () => {
    render(<AcdPending />);

    expect(
      screen.getByText(
        'Your file is pending upload. Uploads are started every 10 minutes. You can close the modal and we will e-mail you when your ACD is complete.',
      ),
    ).toBeInTheDocument();

    expect(screen.getByText('Cancelling your upload will remove all uploaded data')).toBeInTheDocument();
  });

  it('does not show transmitting message by default', () => {
    render(<AcdPending />);

    expect(screen.queryByText(/Your file is currently/)).not.toBeInTheDocument();
  });

  it('shows transmitting message when isTransmitting is true', () => {
    render(<AcdPending isTransmitting={true} />);

    expect(screen.getByText(/Your file is currently/)).toBeInTheDocument();

    // Check for bold text within the transmitting message
    const transmittingText = screen.getByText('Transmitting');
    expect(transmittingText).toBeInTheDocument();
    expect(transmittingText.tagName).toBe('B');
  });

  it('does not show transmitting message when isTransmitting is false', () => {
    render(<AcdPending isTransmitting={false} />);

    expect(screen.queryByText(/Your file is currently/)).not.toBeInTheDocument();
  });

  it('renders all messages when isTransmitting is true', () => {
    render(<AcdPending isTransmitting={true} />);

    // All three messages should be present
    expect(
      screen.getByText(
        'Your file is pending upload. Uploads are started every 10 minutes. You can close the modal and we will e-mail you when your ACD is complete.',
      ),
    ).toBeInTheDocument();

    expect(screen.getByText('Cancelling your upload will remove all uploaded data')).toBeInTheDocument();

    expect(screen.getByText(/Your file is currently/)).toBeInTheDocument();
  });

  it('renders with correct structure using Stack', () => {
    const { container } = render(<AcdPending />);

    // Check that Stack is rendered (MUI Stack renders as a div with specific classes)
    const stack = container.querySelector('.MuiStack-root');
    expect(stack).toBeInTheDocument();
  });

  it('renders Typography components with correct variant', () => {
    const { container } = render(<AcdPending isTransmitting={true} />);

    // All Typography components should have body1 variant
    const typographyElements = container.querySelectorAll('.MuiTypography-body1');
    expect(typographyElements.length).toBe(3);
  });

  it('renders bold text correctly in transmitting message', () => {
    render(<AcdPending isTransmitting={true} />);

    const boldElements = screen.getAllByText((_, element) => {
      return element?.tagName === 'B';
    });

    expect(boldElements.length).toBe(1);
    expect(boldElements[0]).toHaveTextContent('Transmitting');
  });
});
