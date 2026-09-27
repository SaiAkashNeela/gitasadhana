export function buildDailyUsageUpdate(userId: string, day: string) {
  return {
    $inc: { count: 1 },
    $setOnInsert: { userId, day },
  };
}
