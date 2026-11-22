export function createDeckRepository(db) {
    return {
        getAllDecks() {
            return db.prepare('SELECT * FROM decks').all();
        },

        getDeckById(id) {
            return db.prepare('SELECT * FROM decks WHERE id = ?').get(id);
        },

        createDeck(deck) {
            const result = db.prepare(
                'INSERT INTO decks (code, name, description) VALUES (?, ?, ?)'
            ).run(deck.code, deck.name, deck.description);

            return this.getDeckById(result.lastInsertRowid);
        },

        updateDeck(id, deck) {
            db.prepare(
                'UPDATE decks SET code = ?, name = ?, description = ? WHERE id = ?'
            ).run(deck.code, deck.name, deck.description, id);

            return this.getDeckById(id);
        },

        deleteDeck(id) {
            return db.prepare('DELETE FROM decks WHERE id = ?').run(id);
        }
    };
}
