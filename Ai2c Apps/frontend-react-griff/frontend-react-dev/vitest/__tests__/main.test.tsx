import { createRoot } from 'react-dom/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(),
}));

vi.mock('../../src/store/store', () => ({
  store: {},
}));

vi.mock('../../src/routes', () => ({
  router: {},
}));

// Mock document.getElementById
const mockContainer = document.createElement('div');
vi.spyOn(document, 'getElementById').mockReturnValue(mockContainer);

describe('main.tsx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the app correctly', async () => {
    const mockRoot = { render: vi.fn(), unmount: vi.fn() };
    const mockCreateRoot = vi.mocked(createRoot);
    mockCreateRoot.mockReturnValue(mockRoot);

    // Import main.tsx to execute the rendering logic
    await import('../../src/main.tsx');

    expect(document.getElementById).toHaveBeenCalledWith('root');
    expect(mockCreateRoot).toHaveBeenCalledWith(mockContainer);
    expect(mockRoot.render).toHaveBeenCalledTimes(1);
  });
});
