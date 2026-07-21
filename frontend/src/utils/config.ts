/**
 * Application Configuration
 */
export const config = {
  // API Configuration
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  
  // Feature Flags
  features: {
    enableVoice: true,
    enableTelemetry: true,
  },
  
  // Mock Data Rates (for Demo)
  demo: {
    anomalyRate: 0.05, // 5% chance of anomaly in telemetry
  }
};
