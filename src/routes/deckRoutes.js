import express from 'express';

export function createDeckRoutes(deckController) {
    const router = express.Router();

    router.get('/', deckController.getAll);
    router.get('/:id', deckController.getById);
    router.post('/', deckController.create);
    router.patch('/:id', deckController.update);
    router.delete('/:id', deckController.delete);

    return router;
}
