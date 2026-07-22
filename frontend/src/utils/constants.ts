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

  // Node Colors (ISA-101)
  GRAPH_COLORS: {
    EQUIPMENT: "#E8EAED",  // Primary Text (Neutral)
    DOCUMENT: "#8B93A1",   // Secondary Text (Muted)
    INCIDENT: "#FF5D5D",   // Alarm Red
    WORK_ORDER: "#F0A03C", // Caution Amber
    DEFAULT: "#8B93A1",
    LINK: "#343A45",       // Structural
    ACCENT: "#3FC1C9",     // Interactive Accent
    CANVAS: "#1A1D24",     // Canvas
    SURFACE: "#22262E"     // Surface
  }
};
