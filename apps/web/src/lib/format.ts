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