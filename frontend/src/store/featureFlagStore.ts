import { create } from 'zustand';
import { runtimeConfig } from '../config/runtimeConfig';

interface FeatureFlags {
  simulation: boolean;
  replay: boolean;
  advancedML: boolean;
}

interface FeatureFlagState {
  flags: FeatureFlags;
  
  // Actions
  isEnabled: (feature: keyof FeatureFlags) => boolean;
  setFlag: (feature: keyof FeatureFlags, enabled: boolean) => void;
}

export const useFeatureFlagStore = create<FeatureFlagState>((set, get) => ({
  flags: {
    simulation: runtimeConfig.features.simulation,
    replay: runtimeConfig.features.replay,
    advancedML: runtimeConfig.features.advancedML,
  },

  isEnabled: (feature: keyof FeatureFlags) => {
    return get().flags[feature];
  },

  setFlag: (feature: keyof FeatureFlags, enabled: boolean) => {
    set((state) => ({
      flags: {
        ...state.flags,
        [feature]: enabled,
      },
    }));
  },
}));
