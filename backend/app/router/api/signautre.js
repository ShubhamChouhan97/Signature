import {Router} from 'express';
import { checkLoginStatus } from "../../middleware/checkAuth.js";
import { UploadSign } from '../../middleware/signatureUpload.js';
import { resizeAndSaveImage } from '../../middleware/imageresize.js'
import { uploadSignature,allSign,SignRequestOtpVerify,SignRequest,DeleteSign } from '../../controller/signatureController.js';
const router = Router();

router.post('/uploadSignature',checkLoginStatus,UploadSign.single("signature"),resizeAndSaveImage,uploadSignature); // upload signature
router.get('/allSign',checkLoginStatus,allSign); // give all signature to user
router.post('/SignRequest',checkLoginStatus,SignRequest); // sign the documents
router.post('/SignRequestOtpVerify',checkLoginStatus,SignRequestOtpVerify); // verify OTP for signing documents know by pass the request
router.post('/DeleteSign',checkLoginStatus,DeleteSign)

export default router;