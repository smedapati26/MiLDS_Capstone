

import { configureStore } from "@reduxjs/toolkit";

import { maintenanceScheduleFormReducer, resetMaintenanceScheduleForm, setAircraftSerialId, setEventEnd, setEventStart, setInspectionReferenceId, setLaneId, setNotes, setUic } from "@features/maintenance-schedule/slices";

describe("maintenanceScheduleFormSlice", () => {
  const store = configureStore({reducer: {maintenanceScheduleForm: maintenanceScheduleFormReducer}});

  it("should handle initial state", () => {
    const state = store.getState().maintenanceScheduleForm;
    expect(state.maintenanceType).toBe("INSP");
    expect(state.aircraftId).toBe(null);
    expect(state.poc).toBe(null);
    expect(state.inspectionReferenceId).toBe(null);
    expect(state.laneId).toBe(null);
    expect(state.eventStart).toBe(null);
    expect(state.eventStart).toBe(null);
    expect(state.notes).toBe("");
  });

  it("handle set value", () => {
    store.dispatch(setAircraftSerialId("test serial id"));
    store.dispatch(setUic("test poc"));
    store.dispatch(setInspectionReferenceId(1));
    store.dispatch(setLaneId(2));
    store.dispatch(setEventStart("test event start"));
    store.dispatch(setEventEnd("test event end"));
    store.dispatch(setNotes("test notes"));
    const state = store.getState().maintenanceScheduleForm;
    expect(state.aircraftId).toBe("test serial id");
    expect(state.poc).toBe("test poc");
    expect(state.inspectionReferenceId).toBe(1);
    expect(state.laneId).toBe(2);
    expect(state.eventStart).toBe("test event start");
    expect(state.eventEnd).toBe("test event end");
    expect(state.notes).toBe("test notes");
  });
  it ("test reset of form values", () => {
    store.dispatch(setAircraftSerialId("test serial id"));
    store.dispatch(setUic("test poc"));
    store.dispatch(setInspectionReferenceId(1));
    store.dispatch(setLaneId(2));
    store.dispatch(setEventStart("test event start"));
    store.dispatch(setEventEnd("test event end"));
    store.dispatch(setNotes("test notes"));
    store.dispatch(resetMaintenanceScheduleForm());

    const state = store.getState().maintenanceScheduleForm;

    expect(state.maintenanceType).toBe("INSP");
    expect(state.aircraftId).toBe(null);
    expect(state.poc).toBe(null);
    expect(state.inspectionReferenceId).toBe(null);
    expect(state.laneId).toBe(null);
    expect(state.eventStart).toBe(null);
    expect(state.eventStart).toBe(null);
    expect(state.notes).toBe("");
  });
});