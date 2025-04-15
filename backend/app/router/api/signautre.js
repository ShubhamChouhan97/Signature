import {Router} from 'express';

const router = Router();

router.get('/', async (req, res, next) => {
    try {
        throw new Error("Not Implemented yet");
    } catch (error) {
        next(error);
    }
});

export default router;