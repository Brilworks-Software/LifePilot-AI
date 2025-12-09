import { makeObservable, observable, action } from 'mobx';
import type { GeminiConfigData } from '../firebase/types';

class GeminiConfigStore {
  // Observable to store GeminiConfigData; starts as undefined
  config: GeminiConfigData | undefined = undefined;

  constructor() {
    makeObservable(this, {
      config: observable,
      setConfig: action,
    });
  }

  // Action to update the config
  setConfig = (newConfig: GeminiConfigData) => {
    this.config = newConfig;
  };
  
  // Cleanup method if needed (e.g., on app unmount)
  dispose = () => {
    // Any necessary cleanup can be performed here
  };
}

// Export a singleton instance for use across the app
export const geminiConfigStore = new GeminiConfigStore();