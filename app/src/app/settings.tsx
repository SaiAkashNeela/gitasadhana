import { Redirect } from "expo-router";

/** The original app's /settings rendered the profile screen. */
export default function Settings() {
  return <Redirect href="/profile" />;
}
