import { FormProvider, useForm } from 'react-hook-form';

import { act, render, renderHook, screen } from '@testing-library/react';

import { RHFProgressIndicator, useDebouncedIsTyping } from '@components/react-hook-form';

describe('useDebouncedIsTyping', () => {
  vi.useFakeTimers();

  it('returns true immediately when fields change, then false after delay', () => {
    const { result, rerender } = renderHook(({ fields }) => useDebouncedIsTyping(fields, 500), {
      initialProps: { fields: { name: '' } },
    });

    // Initial change triggers typing = true
    expect(result.current).toBe(true);

    // Trigger another change
    rerender({ fields: { name: 'John' } });
    expect(result.current).toBe(true);

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe(false);
  });
});

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({ defaultValues: { name: '' } });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('RHFProgressIndicator', () => {
  vi.useFakeTimers();

  it('shows and hides progress indicator based on typing', () => {
    const { rerender } = render(
      <Wrapper>
        <RHFProgressIndicator />
      </Wrapper>,
    );

    // Should show immediately because useWatch triggers typing
    expect(screen.getByText('Progress saving...')).toBeInTheDocument();

    // Advance debounce timer
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should disappear
    expect(screen.queryByText('Progress saving...')).toBeNull();

    // Simulate typing again by re-rendering with changed form values
    rerender(
      <Wrapper>
        <RHFProgressIndicator />
      </Wrapper>,
    );
  });
});
