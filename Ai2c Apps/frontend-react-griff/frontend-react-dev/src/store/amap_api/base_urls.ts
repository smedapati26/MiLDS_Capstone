const { VITE_AMAP_API_URL } = import.meta.env;

/* Base URL */
export const AMAP_USERS_BASE_URL = `${VITE_AMAP_API_URL}/users`;
export const PERSONNEL_BASE_URL = `${VITE_AMAP_API_URL}/personnel/readiness`;
export const PERSONNEL_UNIT_BASE_URL = `${VITE_AMAP_API_URL}/personnel/readiness/unit`;
