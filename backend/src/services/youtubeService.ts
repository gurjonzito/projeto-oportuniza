import axios from 'axios'

export async function searchYoutubeVideos(query: string) {

  const response = await axios.get(
    'https://www.googleapis.com/youtube/v3/search',
    {
      params: {
        key: process.env.YOUTUBE_API_KEY,
        q: query,
        part: 'snippet',
        maxResults: 10,
        type: 'video'
      }
    }
  )

  return response.data.items
}