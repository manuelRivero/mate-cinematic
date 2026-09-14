export const PRELOAD_EVENT = "imperial:preload";

export type PreloadDetail = { locked: boolean };

export function dispatchPreloadLock(locked: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<PreloadDetail>(PRELOAD_EVENT, { detail: { locked } }),
  );
}
