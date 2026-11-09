// 686 -> "11 min", 5400 -> "1h 30m", 15 -> "15 sec"
export function formatDuration(totalSeconds: number) {
  if (totalSeconds < 60) return `${totalSeconds} sec`;

  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export function lessonLabel(count: number) {
  return `${count} ${count === 1 ? "lesson" : "lessons"}`;
}

// 65 -> "1:05", 3725 -> "1:02:05". Used by the video player.
export function formatClock(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}