"use client";

import { useEffect, useState, useCallback } from "react";

export type InspectionPart = "virola" | "cuero" | "base" | null;

type Listener = () => void;

let activePart: InspectionPart = null;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getInspectionPart(): InspectionPart {
  return activePart;
}

export function setInspectionPart(part: InspectionPart) {
  if (activePart === part) return;
  activePart = part;
  emit();
}

export function subscribeInspection(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useInspectionPart(): [
  InspectionPart,
  (part: InspectionPart) => void,
] {
  const [part, setPart] = useState<InspectionPart>(getInspectionPart);

  useEffect(() => subscribeInspection(() => setPart(getInspectionPart())), []);

  const update = useCallback((next: InspectionPart) => {
    setInspectionPart(next);
  }, []);

  return [part, update];
}
