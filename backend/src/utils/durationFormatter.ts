export function formatDuration(
  iso: string
) {

  const match =
    iso.match(
      /PT(?:(\d+)M)?(?:(\d+)S)?/
    )

  if (!match) {
    return "00:00"
  }

  const minutes =
    match[1] || "0"

  const seconds =
    match[2] || "0"

  return `${minutes}:${seconds
    .padStart(2, "0")}`
}