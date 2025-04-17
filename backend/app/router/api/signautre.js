import {Router} from 'express';
import { checkLoginStatus } from "../../middleware/checkAuth.js";
import { UploadSign } from '../../middleware/signatureUpload.js';
import { uploadSignature,allSign } from '../../controller/signatureController.js';
const router = Router();

router.post('/uploadSignature',checkLoginStatus,UploadSign.single("signature"),uploadSignature)
router.get('/allSign',checkLoginStatus,allSign);


export default router;