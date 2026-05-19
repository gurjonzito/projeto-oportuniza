import { Router } from 'express'
import axios from 'axios'

const router = Router()
const BASE = 'https://www.googleapis.com/youtube/v3'
const KEY = process.env.YOUTUBE_API_KEY!

// GET /api/videos?q=excel&category=tecnologia
router.get('/', async (req, res, next) => {
  try {
    const q = (req.query.q as string) || 'mercado de trabalho jovem'
    const { data } = await axios.get(`${BASE}/search`, {
      params: {
        part: 'snippet',
        q,
        type: 'video',
        maxResults: 12,
        relevanceLanguage: 'pt',
        regionCode: 'BR',
        key: KEY,
      },
    })

    const videoIds = data.items
      .map((i: any) => i.id.videoId)
      .filter(Boolean)
      .join(',')

    // Segunda chamada: pega duração dos vídeos
    const { data: detalhes } = await axios.get(`${BASE}/videos`, {
      params: { part: 'contentDetails', id: videoIds, key: KEY },
    })

    const duracaoMap: Record<string, string> = {}
    detalhes.items.forEach((v: any) => {
      duracaoMap[v.id] = parseDuracao(v.contentDetails.duration)
    })

    const videos = data.items
      .filter((i: any) => i.id.videoId)
      .map((item: any) => ({
        id: item.id.videoId,
        videoId: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.high?.url ?? '',
        duration: duracaoMap[item.id.videoId] ?? '??:??',
        category: req.query.category as string || 'geral',
        summary: item.snippet.description,
      }))

    res.json({ videos })
  } catch (err) {
    next(err)
  }
})

function parseDuracao(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return '00:00'
  const h = match[1] ? `${match[1]}:` : ''
  const m = String(match[2] ?? '0').padStart(2, '0')
  const s = String(match[3] ?? '0').padStart(2, '0')
  return `${h}${m}:${s}`
}

export { router as videoRoutes }