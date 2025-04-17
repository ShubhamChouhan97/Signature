import { Router } from 'express';
import upload from '../../middleware/templateupload.js';
import uploadexcel from '../../middleware/exceldataupload.js';
import { createRequest,allrequest,templateDownload,bulkUpload,tablehead,tabledata,sendtoofficer,deleteRequest,cloneRequest,templateExcelDownload,PreviewRequest} from '../../controller/requestController.js';
import { checkLoginStatus } from '../../middleware/checkAuth.js';

const router = Router();

router.post('/redersend',checkLoginStatus, upload.single('template'), createRequest);
router.get('/allrequest',checkLoginStatus,allrequest);
router.post('/templateDownload',checkLoginStatus,templateDownload);
router.post('/templateExcelDownload',checkLoginStatus,templateExcelDownload);
router.post('/bulkUpload',checkLoginStatus, uploadexcel.single("file"), bulkUpload);
router.post('/tablehead',checkLoginStatus,tablehead);
router.post('/tabledata',checkLoginStatus,tabledata);
router.post('/send-to-officer',checkLoginStatus,sendtoofficer);
router.post('/deleteRequest',checkLoginStatus,deleteRequest);
router.post('/cloneRequest',checkLoginStatus,cloneRequest);
router.post('/PreviewRequest',checkLoginStatus,PreviewRequest);
export default router;
