import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import roomRoutes from './routes/roomRoutes.js';

const app = express();
const swaggerDocument = YAML.load('./src/docs/swagger.yaml');

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/rooms', roomRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa: http://localhost:${PORT}`);
    console.log(`Dokumentacja Swagger: http://localhost:${PORT}/api-docs`);
});