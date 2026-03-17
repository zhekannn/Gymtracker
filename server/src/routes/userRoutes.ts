import { Router } from 'express';
import {register} from '../controllers/userRegister'
import  {login} from '../controllers/userLogin';
import { authMiddleware } from '../middleware/authMiddleware';
const router = Router();
router.post('/login', login);
router.post('/users', register);
router.get('/me',authMiddleware, (req, res)=>{
    res.json({message: "У вас есть доступ!", userData: (req as any).user })
})
export default router;