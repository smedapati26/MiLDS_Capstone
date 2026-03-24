import { dailyStatusReportRoutes } from '@features/daily-status-report/routes';

describe('dailyStatusReportRoutes', () => {
  it('show have routes for DSR Unit', () => {
    const unitPath = dailyStatusReportRoutes.find((route) => route.path === 'unit');
    expect(unitPath).toBeDefined();
  });

  it('show have routes for DSR Subordinate units', () => {
    const subordinatePath = dailyStatusReportRoutes.find((route) => route.path === 'subordinates');
    expect(subordinatePath).toBeDefined();
  });
});
