// eslint-disable-next-line @typescript-eslint/no-explicit-any -- window.__PORTAL_ADMIN_FE_ENV__ is injected at runtime via runtime-config.js and has no type definition
const runtimeEnv = (window as any).__PORTAL_ADMIN_FE_ENV__ ?? {};

/**
 * Centralized environment configuration.
 *
 * In development (npm run dev): values come from VITE_* in .env via Vite.
 * In containers: RUNTIME_* values are set via a mounted runtime-config.js
 * (ConfigMap in OpenShift, volume mount in Docker) and take precedence.
 *
 * Namespaced (not window._env_): if this app is ever loaded as a Module
 * Federation remote/host alongside others, a shared global would let its
 * config leak into — or be clobbered by — theirs.
 */
export const env = {
  bffUrl: runtimeEnv.RUNTIME_BFF_URL || import.meta.env.VITE_BFF_URL || "",
};
