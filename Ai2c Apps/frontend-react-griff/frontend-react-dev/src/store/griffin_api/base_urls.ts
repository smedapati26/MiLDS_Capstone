const { VITE_GRIFFIN_API_URL } = import.meta.env;

/* Base Urls */
// TODO: Use Proxy to rewrite API paths
export const AGSE_BASE_URL = `${VITE_GRIFFIN_API_URL}/agse`;
export const AIRCRAFT_BASE_URL = `${VITE_GRIFFIN_API_URL}/aircraft`;
export const AUTO_DSR_BASE_URL = `${VITE_GRIFFIN_API_URL}/auto_dsr`;
export const COMPONENTS_BASE_URL = `${VITE_GRIFFIN_API_URL}/components`;
export const EQUIPMENT_BASE_URL = `${VITE_GRIFFIN_API_URL}/equipment`;
export const EVENTS_BASE_URL = `${VITE_GRIFFIN_API_URL}/events`;
export const FAULTS_BASE_URL = `${VITE_GRIFFIN_API_URL}/faults`;
export const FHP_BASE_URL = `${VITE_GRIFFIN_API_URL}/fhp`;
export const INSPECTIONS_BASE_URL = `${VITE_GRIFFIN_API_URL}/inspections`;
export const MODS_BASE_URL = `${VITE_GRIFFIN_API_URL}/mods`;
export const PERSONNEL_BASE_URL = `${VITE_GRIFFIN_API_URL}/personnel`;
export const READINESS_BASE_URL = `${VITE_GRIFFIN_API_URL}/readiness`;
export const REPORTS_BASE_URL = `${VITE_GRIFFIN_API_URL}/reports`;
export const TASKFORCE_BASE_URL = `${VITE_GRIFFIN_API_URL}/task_force`;
export const UAS_BASE_URL = `${VITE_GRIFFIN_API_URL}/uas`;
export const GRIFFIN_USER_BASE_URL = `${VITE_GRIFFIN_API_URL}/users`;
