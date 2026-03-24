 

import { render, screen } from '@testing-library/react';

import { AddSyncField } from '@features/equipment-manager/components/helper';

describe('AddSyncField', () => {
  it('renders children', () => {
    render(
      <AddSyncField field="test" syncs={{ test: true }}>
        <div>Child Content</div>
      </AddSyncField>,
    );
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('shows SyncDisabledIcon when field is unsynced', () => {
    render(
      <AddSyncField field="test" syncs={{ test: false }}>
        <div>Child Content</div>
      </AddSyncField>,
    );
    // The icon has aria-label="sync disabled" by default
    expect(screen.getByTestId('SyncDisabledIcon')).toBeInTheDocument();
  });

  it('does not show SyncDisabledIcon when field is synced', () => {
    render(
      <AddSyncField field="test" syncs={{ test: true }}>
        <div>Child Content</div>
      </AddSyncField>,
    );
    expect(screen.queryByTestId('SyncDisabledIcon')).not.toBeInTheDocument();
  });

  it('does not show SyncDisabledIcon when field is not in syncs', () => {
    render(
      <AddSyncField field="other" syncs={{ test: true }}>
        <div>Child Content</div>
      </AddSyncField>,
    );
    expect(screen.queryByTestId('SyncDisabledIcon')).not.toBeInTheDocument();
  });
});
