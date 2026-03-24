
import { maintenanceScheduleRoutes } from '@features/maintenance-schedule/routes';


describe("maintenanceScheduleRoutes", () => {
  it("show have routes for Calendar", () => {
    const calendarRoute = maintenanceScheduleRoutes.find((route) => route.path === 'calendar');
    expect(calendarRoute).toBeDefined();
  });

  it("show have routes for Phase Flow", () => {
    const phaseFlowRoute = maintenanceScheduleRoutes.find((route) => route.path === 'phaseFlow');
    expect(phaseFlowRoute).toBeDefined();
  });
});