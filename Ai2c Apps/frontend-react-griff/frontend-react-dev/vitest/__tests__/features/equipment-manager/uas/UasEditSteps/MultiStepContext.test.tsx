import { describe, expect, it } from 'vitest';

import { render, renderHook, screen } from '@testing-library/react';
import { act } from '@testing-library/react';

import { MultiStepProvider, useUasMultiStepData } from '@features/equipment-manager/uas/UasEditSteps';

import { IAutoDsrLocation } from '@store/griffin_api/auto_dsr/models/IAutoDsr';

describe('MultiStepContext', () => {
  describe('MultiStepProvider', () => {
    it('should render children', () => {
      render(
        <MultiStepProvider>
          <div>Test Child</div>
        </MultiStepProvider>,
      );

      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should provide context to children', () => {
      const TestComponent = () => {
        const context = useUasMultiStepData();
        return <div>{context ? 'Context Available' : 'No Context'}</div>;
      };

      render(
        <MultiStepProvider>
          <TestComponent />
        </MultiStepProvider>,
      );

      expect(screen.getByText('Context Available')).toBeInTheDocument();
    });
  });

  describe('useUasMultiStepData Hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useUasMultiStepData());
      }).toThrow('useUasMultiStepData must be used within an MultiStepProvider');

      consoleSpy.mockRestore();
    });

    it('should return context value when used inside provider', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      expect(result.current).toBeDefined();
      expect(result.current.launchStatus).toBeDefined();
      expect(result.current.setLaunchStatus).toBeDefined();
    });
  });

  describe('Initial Values', () => {
    it('should have correct initial launchStatus', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      expect(result.current.launchStatus).toBe('RTL');
    });

    it('should have correct initial flightHours', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      expect(result.current.flightHours).toBe('0');
    });

    it('should have correct initial ORStatus', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      expect(result.current.ORStatus).toBe('FMC');
    });

    it('should have correct initial remarks', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      expect(result.current.remarks).toBe('');
    });

    it('should have correct initial location', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      expect(result.current.location).toBeUndefined();
    });

    it('should have correct initial fieldSyncStatus', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      expect(result.current.fieldSyncStatus).toEqual({
        rtl: true,
        status: true,
        flightHours: true,
        remarks: true,
        location: true,
      });
    });

    it('should have correct initial isNextReady', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      expect(result.current.isNextReady).toBe(true);
    });
  });

  describe('State Updates - launchStatus', () => {
    it('should update launchStatus', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      act(() => {
        result.current.setLaunchStatus('NRTL');
      });

      expect(result.current.launchStatus).toBe('NRTL');
    });

    it('should update launchStatus multiple times', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      act(() => {
        result.current.setLaunchStatus('NRTL');
      });
      expect(result.current.launchStatus).toBe('NRTL');

      act(() => {
        result.current.setLaunchStatus('RTL');
      });
      expect(result.current.launchStatus).toBe('RTL');
    });
  });

  describe('State Updates - flightHours', () => {
    it('should update flightHours', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      act(() => {
        result.current.setFlightHours('100');
      });

      expect(result.current.flightHours).toBe('100');
    });

    it('should handle empty string for flightHours', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      act(() => {
        result.current.setFlightHours('');
      });

      expect(result.current.flightHours).toBe('');
    });

    it('should handle decimal values for flightHours', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      act(() => {
        result.current.setFlightHours('123.5');
      });

      expect(result.current.flightHours).toBe('123.5');
    });
  });

  describe('State Updates - ORStatus', () => {
    it('should update ORStatus', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      act(() => {
        result.current.setORStatus('PMC');
      });

      expect(result.current.ORStatus).toBe('PMC');
    });

    it('should update ORStatus to different values', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      const statuses = ['FMC', 'PMC', 'NMC', 'DADE'];

      statuses.forEach((status) => {
        act(() => {
          result.current.setORStatus(status);
        });
        expect(result.current.ORStatus).toBe(status);
      });
    });
  });

  describe('State Updates - remarks', () => {
    it('should update remarks', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      act(() => {
        result.current.setRemarks('Test remark');
      });

      expect(result.current.remarks).toBe('Test remark');
    });

    it('should handle multiline remarks', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      const multilineRemark = 'Line 1\nLine 2\nLine 3';

      act(() => {
        result.current.setRemarks(multilineRemark);
      });

      expect(result.current.remarks).toBe(multilineRemark);
    });

    it('should handle empty remarks', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      act(() => {
        result.current.setRemarks('Some text');
      });
      expect(result.current.remarks).toBe('Some text');

      act(() => {
        result.current.setRemarks('');
      });
      expect(result.current.remarks).toBe('');
    });
  });

  describe('State Updates - location', () => {
    it('should update location', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      const mockLocation: IAutoDsrLocation = {
        id: 1,
        name: 'Test Location',
        code: 'TL',
      };

      act(() => {
        result.current.setLocation(mockLocation);
      });

      expect(result.current.location).toEqual(mockLocation);
    });

    it('should handle null location', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      act(() => {
        result.current.setLocation(null);
      });

      expect(result.current.location).toBeNull();
    });

    it('should handle undefined location', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      const mockLocation: IAutoDsrLocation = {
        id: 1,
        name: 'Test Location',
        code: 'TL',
      };

      act(() => {
        result.current.setLocation(mockLocation);
      });
      expect(result.current.location).toEqual(mockLocation);

      act(() => {
        result.current.setLocation(undefined);
      });
      expect(result.current.location).toBeUndefined();
    });
  });

  describe('State Updates - fieldSyncStatus', () => {
    it('should update fieldSyncStatus', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      const newSyncStatus = {
        rtl: false,
        status: false,
        flightHours: false,
        remarks: false,
        location: false,
      };

      act(() => {
        result.current.setFieldSyncStatus(newSyncStatus);
      });

      expect(result.current.fieldSyncStatus).toEqual(newSyncStatus);
    });

    it('should update individual field in fieldSyncStatus', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      act(() => {
        result.current.setFieldSyncStatus((prev) => ({ ...prev, rtl: false }));
      });

      expect(result.current.fieldSyncStatus.rtl).toBe(false);
      expect(result.current.fieldSyncStatus.status).toBe(true);
    });

    it('should add new field to fieldSyncStatus', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      act(() => {
        result.current.setFieldSyncStatus((prev) => ({ ...prev, newField: true }));
      });

      expect(result.current.fieldSyncStatus.newField).toBe(true);
    });
  });

  describe('State Updates - isNextReady', () => {
    it('should update isNextReady', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      act(() => {
        result.current.setIsNextReady(false);
      });

      expect(result.current.isNextReady).toBe(false);
    });

    it('should toggle isNextReady', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      expect(result.current.isNextReady).toBe(true);

      act(() => {
        result.current.setIsNextReady(false);
      });
      expect(result.current.isNextReady).toBe(false);

      act(() => {
        result.current.setIsNextReady(true);
      });
      expect(result.current.isNextReady).toBe(true);
    });
  });

  describe('resetUasMultiEditData', () => {
    it('should reset all values to initial state', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      // Change all values
      act(() => {
        result.current.setLaunchStatus('NRTL');
        result.current.setFlightHours('100');
        result.current.setORStatus('PMC');
        result.current.setRemarks('Test remark');
        result.current.setLocation({ id: 1, name: 'Test', code: 'T' });
        result.current.setFieldSyncStatus({ rtl: false, status: false });
        result.current.setIsNextReady(false);
      });

      // Verify values changed
      expect(result.current.launchStatus).toBe('NRTL');
      expect(result.current.flightHours).toBe('100');
      expect(result.current.ORStatus).toBe('PMC');
      expect(result.current.remarks).toBe('Test remark');
      expect(result.current.location).toEqual({ id: 1, name: 'Test', code: 'T' });
      expect(result.current.isNextReady).toBe(false);

      // Reset
      act(() => {
        result.current.resetUasMultiEditData();
      });

      // Verify all values reset
      expect(result.current.launchStatus).toBe('RTL');
      expect(result.current.flightHours).toBe('0');
      expect(result.current.ORStatus).toBe('FMC');
      expect(result.current.remarks).toBe('');
      expect(result.current.location).toBeUndefined();
      expect(result.current.fieldSyncStatus).toEqual({
        rtl: true,
        status: true,
        flightHours: true,
        remarks: true,
        location: true,
      });
      expect(result.current.isNextReady).toBe(true);
    });

    it('should reset when called multiple times', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      act(() => {
        result.current.setLaunchStatus('NRTL');
        result.current.resetUasMultiEditData();
      });
      expect(result.current.launchStatus).toBe('RTL');

      act(() => {
        result.current.setLaunchStatus('NRTL');
        result.current.resetUasMultiEditData();
      });
      expect(result.current.launchStatus).toBe('RTL');
    });

    it('should be a stable function reference', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      const resetFn1 = result.current.resetUasMultiEditData;

      act(() => {
        result.current.setLaunchStatus('NRTL');
      });

      const resetFn2 = result.current.resetUasMultiEditData;

      expect(resetFn1).toBe(resetFn2);
    });
  });

  describe('Multiple State Updates', () => {
    it('should handle updating multiple states at once', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      act(() => {
        result.current.setLaunchStatus('NRTL');
        result.current.setFlightHours('150');
        result.current.setORStatus('NMC');
        result.current.setRemarks('Multiple updates');
      });

      expect(result.current.launchStatus).toBe('NRTL');
      expect(result.current.flightHours).toBe('150');
      expect(result.current.ORStatus).toBe('NMC');
      expect(result.current.remarks).toBe('Multiple updates');
    });

    it('should maintain independent state for each value', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      act(() => {
        result.current.setLaunchStatus('NRTL');
      });
      expect(result.current.launchStatus).toBe('NRTL');
      expect(result.current.flightHours).toBe('0'); // Should remain unchanged

      act(() => {
        result.current.setFlightHours('200');
      });
      expect(result.current.launchStatus).toBe('NRTL'); // Should remain unchanged
      expect(result.current.flightHours).toBe('200');
    });
  });

  describe('Context Value Structure', () => {
    it('should provide all required properties', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      expect(result.current).toHaveProperty('launchStatus');
      expect(result.current).toHaveProperty('setLaunchStatus');
      expect(result.current).toHaveProperty('flightHours');
      expect(result.current).toHaveProperty('setFlightHours');
      expect(result.current).toHaveProperty('ORStatus');
      expect(result.current).toHaveProperty('setORStatus');
      expect(result.current).toHaveProperty('remarks');
      expect(result.current).toHaveProperty('setRemarks');
      expect(result.current).toHaveProperty('location');
      expect(result.current).toHaveProperty('setLocation');
      expect(result.current).toHaveProperty('fieldSyncStatus');
      expect(result.current).toHaveProperty('setFieldSyncStatus');
      expect(result.current).toHaveProperty('isNextReady');
      expect(result.current).toHaveProperty('setIsNextReady');
      expect(result.current).toHaveProperty('resetUasMultiEditData');
    });

    it('should have correct types for setters', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: MultiStepProvider,
      });

      expect(typeof result.current.setLaunchStatus).toBe('function');
      expect(typeof result.current.setFlightHours).toBe('function');
      expect(typeof result.current.setORStatus).toBe('function');
      expect(typeof result.current.setRemarks).toBe('function');
      expect(typeof result.current.setLocation).toBe('function');
      expect(typeof result.current.setFieldSyncStatus).toBe('function');
      expect(typeof result.current.setIsNextReady).toBe('function');
      expect(typeof result.current.resetUasMultiEditData).toBe('function');
    });
  });

  describe('Nested Providers', () => {
    it('should work with nested providers', () => {
      const { result } = renderHook(() => useUasMultiStepData(), {
        wrapper: ({ children }) => (
          <MultiStepProvider>
            <MultiStepProvider>{children}</MultiStepProvider>
          </MultiStepProvider>
        ),
      });

      expect(result.current.launchStatus).toBe('RTL');
    });
  });
});
