import express from 'express';
import { connectToMongoDB } from './config/mongoose.js';
import { router } from './routes/router.js';


await connectToMongoDB('mongodb://localhost:27017/blog');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(router);
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});