import { Router } from 'express';
import {register} from '../controllers/userRegister'
import  {login} from '../controllers/userLogin';
const router = Router();
router.post('/login', login);
router.post('/users', register);
export default router;