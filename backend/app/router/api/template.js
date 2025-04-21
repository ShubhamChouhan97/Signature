import {Router} from 'express';
import { sampletemplate } from '../../controller/templateController.js'
const router = Router();

router.get('/sampleTemplate',sampletemplate);
router.get('/', async (req, res, next) => {
    try {
        throw new Error("Not Implemented yet");
    } catch (error) {
        next(error);
    }
});

export default router;