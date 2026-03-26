import { Router } from 'express';
import {register} from '../controllers/userRegister'
import  {login} from '../controllers/userLogin';
import { plansSelect } from '../controllers/plansSelect';
import { authMiddleware } from '../middleware/authMiddleware';
const router = Router();
router.post('/login', login);
router.post('/users', register);
router.get('/me',authMiddleware, (req, res)=>{
    res.json({message: "Access granted!", userData: (req as any).user })
})
router.get('/plans', plansSelect);
export default router;