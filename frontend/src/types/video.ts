export interface Video {
  id: string
  videoId: string
  title: string
  channel: string
  duration: string
  thumbnail: string
  category: string
  summary: string

  materials?: {
    name: string
    file: string
  }[]
}