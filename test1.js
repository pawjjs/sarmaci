import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';

const rooms = new Map();

const server = createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.url === '/api/health') {
        if (req.method === 'GET') {
            res.statusCode = 200;
            res.end(JSON.stringify({ status: 'ok' }));
            return;
        }

        res.statusCode = 405;
        res.setHeader('Allow', 'GET');
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    if (req.url === '/api/rooms') {
        if (req.method === 'POST') {
            let code;

            do {
                code = randomBytes(3).toString('hex').toUpperCase();
            } while (rooms.has(code));

            const room = {
                code: code,
                status: 'waiting',
                maxPlayers: 2,
                players: [],
                createdAt: new Date().toISOString()
            };

            rooms.set(code, room);

            res.statusCode = 201;
            res.end(JSON.stringify({
                room: room,
                invitePath: `/join/${code}`
            }));
            return;
        }

        res.statusCode = 405;
        res.setHeader('Allow', 'POST');
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }
const roomMatch = req.url.match(/^\/api\/rooms\/([a-f0-9]{6})$/i);

if (roomMatch) {
    if (req.method !== 'GET') {
        res.statusCode = 405;
        res.setHeader('Allow', 'GET');
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    const code = roomMatch[1].toUpperCase();
    const room = rooms.get(code);

    if (!room) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Room not found' }));
        return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({
        room: room,
        invitePath: `/join/${code}`
    }));
    return;
}
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(3000, () => {
    console.log('Serwer działa: http://localhost:3000');
});