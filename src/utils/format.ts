export function formatId(val: number | undefined) {
  return val ? String(val).slice(-3).padStart(3, "0") : "";
}

export function formatTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
