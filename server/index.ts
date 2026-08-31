import { app } from './app'

const port = process.env.API_PORT ?? 8787

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})
