"use client";

export function useWorkspace(_opts?: { provider?: string; autoRefresh?: boolean }) {
  return {
    projects: [] as Array<any>,
    activeProjects: 0,
    completedProjects: 0,
    loading: false,
  };
}

