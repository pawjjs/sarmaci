import { createServer } from 'node:http';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import roomRoutes from './routes/roomRoutes.js';
import { setupWebSocket } from './websocket.js';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('./db/User.db'); 

db.exec(`
CREATE TABLE IF NOT EXISTS User (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
mail TEXT NOT NULL UNIQUE,
password TEXT NOT NULL
);

INSERT OR IGNORE INTO User (name, mail, password)
VALUES ('admin', 'admin@example.com', 'admin123');

`);

const app = express();
const swaggerDocument = YAML.load('./docs/swagger.yaml');

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

app.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({
            error: 'Invalid JSON'
        });
    }

    next(error);
});

const PORT = 3000;
const server = createServer(app);
setupWebSocket(server);

server.listen(PORT, () => {
    console.log(`Serwer działa: http://localhost:${PORT}`);
    console.log(`Dokumentacja Swagger: http://localhost:${PORT}/api-docs`);
});
