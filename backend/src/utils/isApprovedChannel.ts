import { approvedChannels }
  from "./approvedChannels"

export function isApprovedChannel(
  channel: string
) {

  const normalized =
    channel
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()

  return approvedChannels.some(
    approved =>
      normalized.includes(approved)
  )
}