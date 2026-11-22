
export function createDeckService(deckRepository) {

    function validateDeck(deck) {
        if (!deck || typeof deck !== 'object' || Array.isArray(deck)) {
            const error = new Error('Deck data must be an object');
            error.statusCode = 400;
            throw error;
        }

        if (typeof deck.code !== 'string' || !deck.code.trim()) {
            const error = new Error('Code is required');
            error.statusCode = 400;
            throw error;
        }

        if (typeof deck.name !== 'string' || !deck.name.trim()) {
            const error = new Error('Name is required');
            error.statusCode = 400;
            throw error;
        }

        if (typeof deck.description !== 'string') {
            const error = new Error('Description must be a string');
            error.statusCode = 400;
            throw error;
        }
    }

    return {
        getAll() {
            return deckRepository.getAllDecks();
        },

        getById(id) {
            return deckRepository.getDeckById(id);
        },

        create(deck) {
            validateDeck(deck);
            return deckRepository.createDeck(deck);
        },

        update(id, deck) {
            validateDeck(deck);
            return deckRepository.updateDeck(id, deck);
        },

        delete(id) {
            return deckRepository.deleteDeck(id);
        }
    };
}
