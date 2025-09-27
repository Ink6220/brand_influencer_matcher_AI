// Type definitions for Node.js
declare namespace NodeJS {
  export interface ProcessEnv {
    NEXT_PUBLIC_API_URL?: string;
  }
}

// Extend the global Window interface
declare global {
  interface Window {
    // Add any global window properties here if needed
  }
}
