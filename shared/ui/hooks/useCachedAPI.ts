"use client";

type UseCachedOrganizationParams = {
  enabled?: boolean;
};

export function useCachedOrganization(_params: UseCachedOrganizationParams = {}) {
  // Minimal no-op stub to keep UI building without external app hooks
  return {
    data: null as null | { org_name: string; tier: 'free' | 'pro' | 'plus' | 'enterprise' },
    isLoading: false,
    error: null as null | Error,
  };
}

