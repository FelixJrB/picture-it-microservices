import express from 'express'
import { connectToMongoDB } from './src/config/mongoose.js'
import { router } from './src/routes/api/v1/resourceRoutes.js'


await connectToMongoDB('mongodb://localhost:27017/resource-service')

const app = express()
const PORT = 3000 

app.use(express.json({ limit: '500kb'}))
app.use('/api/v1/images', router)

app.use((err, _req, res, _next) => {
  res.status(err.status || 500).json({
    status_code: err.status || 500,
    message: err.message || 'An unexpected condition was encountered.',
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`)
})