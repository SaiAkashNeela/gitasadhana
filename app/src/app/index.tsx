import { Redirect } from "expo-router";

import { hasCompletedOnboarding } from "@/lib/reminders-config";

export default function Index() {
  return <Redirect href={hasCompletedOnboarding() ? "/home" : "/welcome"} />;
}
