
export function createDeckController(deckService) {

    function getId(req) {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            const error = new Error('Invalid deck ID');
            error.statusCode = 400;
            throw error;
        }

        return id;
    }

    return {
        getAll(req, res, next) {
            try {
                const decks = deckService.getAll();
                res.json({ decks });
            } catch (error) {
                next(error);
            }
        },

        getById(req, res, next) {
            try {
                const deck = deckService.getById(getId(req));

                if (!deck) {
                    return res.status(404).json({ error: 'Deck not found' });
                }

                res.json({ deck });
            } catch (error) {
                next(error);
            }
        },

        create(req, res, next) {
            try {
                const deck = deckService.create(req.body);
                res.status(201).json({ deck });
            } catch (error) {
                next(error);
            }
        },

        update(req, res, next) {
            try {
                const deck = deckService.update(getId(req), req.body);

                if (!deck) {
                    return res.status(404).json({ error: 'Deck not found' });
                }

                res.json({ deck });
            } catch (error) {
                next(error);
            }
        },

        delete(req, res, next) {
            try {
                const result = deckService.delete(getId(req));

                if (result.changes === 0) {
                    return res.status(404).json({ error: 'Deck not found' });
                }

                res.status(204).send();
            } catch (error) {
                next(error);
            }
        }
    };
}
