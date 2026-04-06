import express from 'express'
import { connectToMongoDB } from './src/config/mongoose.js'
import { router } from './src/routes/router.js'


await connectToMongoDB('mongodb://localhost:27018/auth-service')

const app = express()
const PORT = 3001

app.use(express.json());
app.use(router);
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`)
});