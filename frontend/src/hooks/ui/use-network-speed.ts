import { useEffect, useState } from 'react';

export type NetworkSpeed = 'slow' | 'medium' | 'fast' | 'unknown';

export interface NetworkInfo {
  speed: NetworkSpeed;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * Hook to detect network speed and adapt loading behavior
 * Uses the Navigation Timing API and Network Information API
 */
export function useNetworkSpeed(): NetworkInfo {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    speed: 'unknown',
  });

  useEffect(() => {
    // Check if Network Information API is available
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      const updateNetworkInfo = () => {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink;
        const rtt = connection.rtt;
        const saveData = connection.saveData;

        // Determine speed based on effectiveType
        let speed: NetworkSpeed = 'unknown';
        if (effectiveType === '4g') {
          speed = 'fast';
        } else if (effectiveType === '3g') {
          speed = 'medium';
        } else if (effectiveType === '2g') {
          speed = 'slow';
        } else if (downlink !== undefined) {
          // Fallback to downlink speed (Mbps)
          if (downlink >= 10) speed = 'fast';
          else if (downlink >= 2.5) speed = 'medium';
          else speed = 'slow';
        }

        setNetworkInfo({
          speed,
          effectiveType,
          downlink,
          rtt,
          saveData,
        });
      };

      updateNetworkInfo();

      // Listen for network changes
      connection.addEventListener('change', updateNetworkInfo);

      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }
  }, []);

  return networkInfo;
}

/**
 * Custom hook to get adaptive loading duration based on network speed
 * Returns milliseconds to wait before hiding skeleton
 */
export function useAdaptiveLoadingDuration(baseMs: number = 300): number {
  const { speed, rtt } = useNetworkSpeed();

  // Adapt duration based on network speed
  if (speed === 'slow') {
    return Math.max(baseMs, (rtt || 150) * 2);
  }
  if (speed === 'medium') {
    return Math.max(baseMs, (rtt || 100) * 1.5);
  }
  // Fast or unknown
  return baseMs;
}

/**
 * Custom hook to determine if we should show high-quality assets
 * On slow networks, show lower quality images
 */
export function useAdaptiveAssets() {
  const { speed, saveData } = useNetworkSpeed();

  return {
    shouldLoadHighQuality: speed === 'fast' && !saveData,
    shouldLazyLoad: speed !== 'fast' || saveData,
    imageQuality: speed === 'slow' ? 'low' : speed === 'medium' ? 'medium' : 'high',
    preferWebP: speed !== 'slow',
  };
}

export default useNetworkSpeed;
