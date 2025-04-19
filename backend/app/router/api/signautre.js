import {Router} from 'express';
import { checkLoginStatus } from "../../middleware/checkAuth.js";
import { UploadSign } from '../../middleware/signatureUpload.js';
import { resizeAndSaveImage } from '../../middleware/imageresize.js'
import { uploadSignature,allSign,SignRequestOtpVerify,SignRequest } from '../../controller/signatureController.js';
const router = Router();

router.post('/uploadSignature',checkLoginStatus,UploadSign.single("signature"),resizeAndSaveImage,uploadSignature);
router.get('/allSign',checkLoginStatus,allSign);
router.post('/SignRequest',checkLoginStatus,SignRequest);
router.post('/SignRequestOtpVerify',checkLoginStatus,SignRequestOtpVerify);
export default router;