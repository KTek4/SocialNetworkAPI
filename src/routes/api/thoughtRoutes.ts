import { Router } from 'express';

const router = Router();

import {
    addReaction,
    createThought,
    deleteThought,
    getAllThoughts,
    getThoughtById,
    removeReaction,
    updateThought
} from '../../controllers/ThoughtController.js';

router.route('/')
    .get(getAllThoughts)
    .post(createThought);

router.route('/:thoughtPId')
    .get(getThoughtById)
    .put(updateThought)
    .delete(deleteThought);

router.route('/:thoughtPId/reactions')
    .post(addReaction)
    .delete(removeReaction);

export { router as thoughtRouter };