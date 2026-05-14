import { videosMock } from "../mocks/videosMock"
import type { Video } from "../types/video"

export const getVideos = async (): Promise<Video[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(videosMock), 300)
  })
}