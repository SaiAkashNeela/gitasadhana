export interface SeedingProgress {
  status: "idle" | "running" | "success" | "error";
  message: string;
  percent: number;
}

export async function seedGitaDatabase(onProgress: (p: SeedingProgress) => void) {
  try {
    onProgress({ status: "running", message: "Preparing local Gita content...", percent: 20 });
    await Promise.resolve();
    onProgress({
      status: "success",
      message: "Gita content is bundled locally, so backend seeding is not required.",
      percent: 100,
    });
  } catch (error: any) {
    onProgress({
      status: "error",
      message: `Seeding failed: ${error.message || error}`,
      percent: 100,
    });
  }
}
