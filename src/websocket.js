import { WebSocket, WebSocketServer } from 'ws';

function sendJson(client, message) {
    if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
    }
}

export function setupWebSocket(server) {
    const wss = new WebSocketServer({ server, path: '/ws' });
    const clientsById = new Map();

    wss.on('connection', (client) => {
        let clientId;

        const sendError = (message) => sendJson(client, { type: 'ERROR', message });

        client.on('error', (error) => {
            console.error('Błąd połączenia WebSocket:', error.message);
        });

        client.on('close', () => {
            if (clientsById.get(clientId) === client) {
                clientsById.delete(clientId);
            }
        });

        client.on('message', (data, isBinary) => {
            if (isBinary) {
                return sendError('Wyślij wiadomość jako tekst JSON.');
            }

            let message;
            try {
                message = JSON.parse(data.toString());
            } catch {
                return sendError('Niepoprawny JSON.');
            }

            if (!message || typeof message !== 'object' || Array.isArray(message)) {
                return sendError('Wiadomość musi być obiektem JSON.');
            }

            switch (message.type) {
                case 'ECHO': {
                    if (typeof message.text !== 'string') {
                        return sendError('Pole text musi być tekstem.');
                    }

                    return sendJson(client, { type: 'ECHO', text: message.text });
                }

                case 'AUTH': {
                    const { id } = message;
                    if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,20}$/.test(id)) {
                        return sendError('ID musi mieć od 1 do 20 znaków: litery ASCII, cyfry, podkreślenie lub myślnik.');
                    }
                    if (clientId !== undefined) {
                        return sendError('To połączenie ma już przypisane ID.');
                    }
                    if (clientsById.has(id)) {
                        return sendError('To ID jest już zajęte.');
                    }

                    clientId = id;
                    clientsById.set(id, client);
                    sendJson(client, { type: 'AUTH_OK', id });

                    for (const connectedClient of wss.clients) {
                        sendJson(connectedClient, { type: 'CLIENT_JOINED', id });
                    }
                    return;
                }

                case 'MSG': {
                    if (clientId === undefined) {
                        return sendError('Najpierw zarejestruj ID przez AUTH.');
                    }
                    if (typeof message.to !== 'string' || typeof message.text !== 'string') {
                        return sendError('Pola to i text muszą być tekstem.');
                    }

                    const recipient = clientsById.get(message.to);
                    if (!recipient || recipient.readyState !== WebSocket.OPEN) {
                        return sendError('Odbiorca nie jest połączony.');
                    }

                    return sendJson(recipient, {
                        type: 'MSG',
                        from: clientId,
                        to: message.to,
                        text: message.text
                    });
                }

                default:
                    return sendError('Nieznany typ wiadomości.');
            }
        });

        client.send('siema');
    });
}
