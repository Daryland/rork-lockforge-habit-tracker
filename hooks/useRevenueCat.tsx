
import { Platform } from 'react-native';
import Purchases, { PurchasesOffering, CustomerInfo } from 'react-native-purchases';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function getRCApiKey(): string {
  if (__DEV__ || Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY ?? '';
  }
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? '',
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? '',
    default: process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY ?? '',
  }) as string;
}

let rcInitialized = false;

const apiKey = getRCApiKey();
if (apiKey) {
  try {
    Purchases.configure({ apiKey });
    rcInitialized = true;
    console.log('[RevenueCat] Configured successfully');
  } catch (e) {
    console.error('[RevenueCat] Configure error:', e);
  }
} else {
  console.warn('[RevenueCat] No API key found');
}

export function useOfferings() {
  return useQuery<PurchasesOffering | null>({
    queryKey: ['rc-offerings'],
    queryFn: async () => {
      if (!rcInitialized) {
        console.warn('[RevenueCat] Not initialized');
        return null;
      }
      try {
        const offerings = await Purchases.getOfferings();
        console.log('[RevenueCat] Offerings fetched:', JSON.stringify(offerings.current?.availablePackages?.length));
        return offerings.current ?? null;
      } catch (e) {
        console.error('[RevenueCat] Offerings error:', e);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCustomerInfo() {
  return useQuery<CustomerInfo | null>({
    queryKey: ['rc-customer-info'],
    queryFn: async () => {
      if (!rcInitialized) return null;
      try {
        const info = await Purchases.getCustomerInfo();
        console.log('[RevenueCat] Customer info fetched, entitlements:', Object.keys(info.entitlements.active));
        return info;
      } catch (e) {
        console.error('[RevenueCat] Customer info error:', e);
        return null;
      }
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useIsProRC(): boolean {
  const { data: customerInfo } = useCustomerInfo();
  return customerInfo?.entitlements?.active?.['pro'] !== undefined;
}

export function usePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (packageId: string) => {
      if (!rcInitialized) throw new Error('RevenueCat not initialized');
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.current;
      if (!currentOffering) throw new Error('No offering available');

      const pkg = currentOffering.availablePackages.find(p => p.identifier === packageId);
      if (!pkg) throw new Error(`Package ${packageId} not found`);

      console.log('[RevenueCat] Purchasing package:', packageId);
      const result = await Purchases.purchasePackage(pkg);
      console.log('[RevenueCat] Purchase success:', result.customerInfo.entitlements.active);
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rc-customer-info'] });
      void queryClient.invalidateQueries({ queryKey: ['rc-offerings'] });
    },
  });
}

export function useRestorePurchases() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!rcInitialized) throw new Error('RevenueCat not initialized');
      console.log('[RevenueCat] Restoring purchases...');
      const info = await Purchases.restorePurchases();
      console.log('[RevenueCat] Restore complete:', Object.keys(info.entitlements.active));
      return info;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rc-customer-info'] });
    },
  });
}
