export const NOTIFICATION_PERMISSION_CLOSED_MESSAGE: string;

export function shouldRequestNotificationPermission(onboardingComplete?: boolean): boolean;

export function shouldShowNotificationPermissionNudge(params?: {
  onboardingComplete?: boolean;
  permissionGranted?: boolean;
}): boolean;
