import { ProviderWrapper, ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { VerticalToolbar } from '@features/maintenance-schedule/components/Calendar';

import { store } from '@store/store';

describe('ToolbarTest', () => {
  beforeEach(() =>
    render(
      <ProviderWrapper store={store}>
        <VerticalToolbar />
      </ProviderWrapper>,
    ),
  );

  it('renders toolbar component', () => {
    const toolbar = document.querySelector('#ms-toolbar');
    expect(toolbar).toBeInTheDocument();
  });

  it('renders toolbar tab buttons', () => {
    const addButton = document.querySelector('[aria-label="add"]');
    expect(addButton).toBeInTheDocument();

    const editButton = document.querySelector('[aria-label="edit"]');
    expect(editButton).toBeInTheDocument();
  });

  it('opens toolbar add tab drawer/panel on click', async () => {
    const addButton = document.querySelector('[aria-label="add"]');
    if (addButton) {
      await userEvent.click(addButton);
      expect(addButton).toHaveClass('Mui-selected');
    }

    const addDrawerTitle = screen.getByRole('heading', { level: 6 });
    expect(addDrawerTitle).toBeInTheDocument();
  });

  it('opens toolbar edit tab drawer/panel on click', async () => {
    const editButton = document.querySelector('[aria-label="edit"]');
    if (editButton) {
      await userEvent.click(editButton);
      expect(editButton).toHaveClass('Mui-selected');
    }

    const editDrawerTitle = screen.getByRole('heading', { level: 6 });
    expect(editDrawerTitle).toBeInTheDocument();
  });

  it('open & close toolbar', async () => {
    const editButton = document.querySelector('[aria-label="edit"]');
    if (editButton) {
      await userEvent.click(editButton);
      expect(editButton).toHaveClass('Mui-selected');
    }

    const editDrawerTitle = screen.getByRole('heading', { level: 6 });
    expect(editDrawerTitle).toBeInTheDocument();
  });
});

describe('ToolbarTestLightMode', () => {
  beforeEach(() =>
    render(
      <ProviderWrapper store={store}>
        <ThemedTestingComponent mode="light">
          <VerticalToolbar />
        </ThemedTestingComponent>
        ,
      </ProviderWrapper>,
    ),
  );

  it('renders toolbar component', () => {
    const toolbar = screen.getByTestId('ms-toolbar');
    expect(toolbar).toBeInTheDocument();
  });
});
