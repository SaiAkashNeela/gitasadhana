export function resolveAppleBundleId(env: NodeJS.ProcessEnv = process.env) {
  return env.APPLE_BUNDLE_ID || env.APPLE_CLIENT_ID || "com.gitasadhana.ios";
}
