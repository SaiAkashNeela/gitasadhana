export const NOTIFICATION_PERMISSION_CLOSED_MESSAGE =
  "Notifications are closed. Please allow them so we can send you regular updates.";

export function shouldRequestNotificationPermission(onboardingComplete = false) {
  return onboardingComplete;
}

export function shouldShowNotificationPermissionNudge({
  onboardingComplete = false,
  permissionGranted = false,
} = {}) {
  return onboardingComplete && !permissionGranted;
}
