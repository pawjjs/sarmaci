import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import roomRoutes from './routes/roomRoutes.js';
import { setupWebSocket } from './websocket.js';

import { openDatabase } from './db/database.js';
import { migrateDatabase } from './db/migrate.js';

import { createDeckRepository } from './repositories/deckRepository.js';
import { createDeckService } from './services/deckService.js';
import { createDeckController } from './controllers/deckController.js';
import { createDeckRoutes } from './routes/deckRoutes.js';

const db = openDatabase();

migrateDatabase(db);

const seed = readFileSync('db/seeds/001_seed_decks.sql', 'utf8');
db.exec(seed);

const deckRepository = createDeckRepository(db);
const deckService = createDeckService(deckRepository);
const deckController = createDeckController(deckService);
const deckRoutes = createDeckRoutes(deckController);

const app = express();
const swaggerDocument = YAML.load('./src/docs/swagger.yaml');

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/rooms', roomRoutes);
app.use('/api/decks', deckRoutes);

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

    if (error.errcode === 2067) {
        return res.status(409).json({
            error: 'Deck code already exists'
        });
    }

    if (error.statusCode) {
        return res.status(error.statusCode).json({
            error: error.message
        });
    }

    console.error(error);

    res.status(500).json({
        error: 'Internal server error'
    });
});

const PORT = 3000;
const server = createServer(app);

setupWebSocket(server);

server.listen(PORT, () => {
    console.log(`Serwer działa: http://localhost:${PORT}`);
    console.log(`Dokumentacja Swagger: http://localhost:${PORT}/api-docs`);
});
