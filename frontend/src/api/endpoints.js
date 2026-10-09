import { api } from "./client";

export const accidentsApi = {
  list: (filters, page = 1, pageSize = 50) => api.get("/accidents", { ...filters, page, page_size: pageSize }),
  get: (accidentIndex) => api.get(`/accidents/${accidentIndex}`),
};

export const analyticsApi = {
  severity: () => api.get("/analytics/severity"),
  hourly: () => api.get("/analytics/hourly"),
  yearly: () => api.get("/analytics/yearly"),
  monthly: () => api.get("/analytics/monthly"),
  dayOfWeek: () => api.get("/analytics/day-of-week"),
  byDimension: (dimension, severityCode) => api.get(`/analytics/by-dimension/${dimension}`, { severity_code: severityCode }),
  leadingCauses: (topN = 10) => api.get("/analytics/leading-causes", { top_n: topN }),
};

export const hotspotsApi = {
  list: (minAccidents = 1, limit = 100) => api.get("/hotspots", { min_accidents: minAccidents, limit }),
  get: (hotspotId) => api.get(`/hotspots/${hotspotId}`),
};

export const predictApi = {
  risk: (payload) => api.post("/predict/risk", payload),
  insight: (payload) => api.post("/predict/insight", payload),
};

export const referenceApi = {
  codes: () => api.get("/reference/codes"),
};

export const healthApi = {
  check: () => api.get("/health"),
};
