/**
 * Application Constants
 */
export const CONSTANTS = {
  // Timeouts & Intervals (ms)
  TIMEOUTS: {
    TELEMETRY_INTERVAL: 1000,
    UPLOAD_SIMULATION: 3000,
    ERP_SAVE_SIMULATION: 1500,
    ERP_SUCCESS_DISPLAY: 1000,
    AGENT_TRACE_DELAY: 300,
    BOOT_SEQUENCE_DELAY_MIN: 100,
    BOOT_SEQUENCE_DELAY_MAX: 300,
  },
  
  // API Fetch Constants
  API: {
    DEFAULT_TIMEOUT: 15000,
    MAX_RETRIES: 2,
    RETRY_DELAY: 1000,
  },

  // Node Colors
  GRAPH_COLORS: {
    EQUIPMENT: "#60a5fa", // Blue-400
    DOCUMENT: "#4ade80",  // Green-400
    INCIDENT: "#f87171",  // Red-400
    WORK_ORDER: "#fbbf24", // Amber-400
    DEFAULT: "#a1a1aa",    // Zinc-400
    LINK: "#27272a"        // Zinc-800
  }
};
