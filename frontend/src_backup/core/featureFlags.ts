export const featureFlags = {
  ENABLE_REPLAY: true,
  ENABLE_HEATMAP: true,
  ENABLE_FORCE_GRAPH: true,
  ENABLE_MULTI_TENANCY: true,
  ENABLE_DEBUG_OVERLAY: true,
}

export const isFeatureEnabled = (feature: keyof typeof featureFlags): boolean => {
  return featureFlags[feature]
}
