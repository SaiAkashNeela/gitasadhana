import test from "node:test";
import assert from "node:assert/strict";

import {
  NOTIFICATION_PERMISSION_CLOSED_MESSAGE,
  shouldRequestNotificationPermission,
  shouldShowNotificationPermissionNudge,
} from "../src/lib/notificationPermission.js";

test("notification permissions wait until onboarding is complete", () => {
  assert.equal(shouldRequestNotificationPermission(false), false);
  assert.equal(shouldRequestNotificationPermission(true), true);
});

test("notification denial message is friendly", () => {
  assert.equal(
    NOTIFICATION_PERMISSION_CLOSED_MESSAGE,
    "Notifications are closed. Please allow them so we can send you regular updates."
  );
});

test("notification nudge appears only after onboarding when permission is closed", () => {
  assert.equal(shouldShowNotificationPermissionNudge({ onboardingComplete: false, permissionGranted: false }), false);
  assert.equal(shouldShowNotificationPermissionNudge({ onboardingComplete: true, permissionGranted: true }), false);
  assert.equal(shouldShowNotificationPermissionNudge({ onboardingComplete: true, permissionGranted: false }), true);
});
