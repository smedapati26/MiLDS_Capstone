import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import Oops from '../../../src/pages/Oops';
import { ThemedTestingComponent } from '../../helpers/ThemedTestingComponent';

// Mock the GriffinFullBodyIcon
vi.mock('@ai2c/pmx-mui', async () => {
  const actual = await vi.importActual('@ai2c/pmx-mui');
  return {
    ...actual,
    GriffinFullBodyIcon: vi.fn(() => <div data-testid="griffin-full-body-icon" />),
  };
});

describe('Oops Page', () => {
  it('renders the Oops page with the correct message and icon', () => {
    render(
      <ThemedTestingComponent>
        <Oops />
      </ThemedTestingComponent>,
    );

    expect(screen.getByText('Oops, we made a mistake...')).toBeInTheDocument();
    expect(screen.getByTestId('griffin-full-body-icon')).toBeInTheDocument();
  });
});
