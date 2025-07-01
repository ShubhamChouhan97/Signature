import { Router } from 'express';
import upload from '../../middleware/templateupload.js';
import uploadexcel from '../../middleware/exceldataupload.js';
import { createRequest,allrequest,templateDownload,bulkUpload,tablehead,tabledata,sendtoofficer,
    deleteRequest,cloneRequest,templateExcelDownload,PreviewRequest,
    RejectRequestByOfficer,DeleteRequestReader,DelegateRequest,RejectRequest,
    printRequest,downloadzip,qrverifypdf,dispatchRequest,dispatchNumberFind} from '../../controller/requestController.js';
import { checkLoginStatus } from '../../middleware/checkAuth.js';

const router = Router();

router.post('/redersend',checkLoginStatus, upload.single('template'), createRequest); // create request
router.get('/allrequest',checkLoginStatus,allrequest);// all request for home page
router.post('/templateDownload',checkLoginStatus,templateDownload);// templte downlaod from home page
router.post('/templateExcelDownload',checkLoginStatus,templateExcelDownload);// excel templte genrate 
router.post('/bulkUpload',checkLoginStatus, uploadexcel.single("file"), bulkUpload); // excel data upload
router.post('/tablehead',checkLoginStatus,tablehead);// table head data for upload section
router.post('/tabledata',checkLoginStatus,tabledata); // tbale data for upload section
router.post('/send-to-officer',checkLoginStatus,sendtoofficer); // officer data
router.post('/deleteRequest',checkLoginStatus,deleteRequest);// deleteRequest
router.post('/cloneRequest',checkLoginStatus,cloneRequest);// clone request 
router.post('/PreviewRequest',checkLoginStatus,PreviewRequest);// preview request with data at upload section 
router.post('/RejectRequestByOfficer',checkLoginStatus,RejectRequestByOfficer);// reject request by officer
router.post('/DeleteRequestReader',checkLoginStatus,DeleteRequestReader);// delete request by officer 
router.post('/DelegateRequest',checkLoginStatus,DelegateRequest);// delegate request to reader agian to sign
router.post('/RejectRequest',checkLoginStatus,RejectRequest); // reject Full request by officer
router.post('/printRequest',checkLoginStatus,printRequest);// print all data of request 
router.post('/downloadzip',checkLoginStatus,downloadzip); // downloadzip folder to user of request
router.post('/qrverifypdf',qrverifypdf);
router.post('/dispatchrequest',checkLoginStatus,dispatchRequest);
router.get('/dispatchnumberfind',checkLoginStatus,dispatchNumberFind);
export default router;
