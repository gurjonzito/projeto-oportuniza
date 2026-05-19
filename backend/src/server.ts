import 'dotenv/config'

import app from './app'
import { youtubeRoutes } from './routes/youtubeRoute'
import { videoRoutes } from './routes/videoRoute'

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando`)
})

app.use('/api/youtube', youtubeRoutes)
app.use('/api/videos', videoRoutes)