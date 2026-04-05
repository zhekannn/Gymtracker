import { Router } from 'express';
import {register} from '../controllers/userRegister'
import  {login} from '../controllers/userLogin';
import { plansSelect } from '../controllers/plansSelect';
import { authMiddleware } from '../middleware/authMiddleware';
import { exSelect } from '../controllers/exSelect';
import { createPlan } from '../controllers/createPlan';
import { deletePlan } from '../controllers/deletePlan';
const router = Router();
router.post('/login', login);
router.post('/users', register);
router.get('/me',authMiddleware, (req, res)=>{
    res.json({message: "Access granted!", userData: (req as any).user })
})
router.get('/exercises', exSelect);
router.get('/plans', plansSelect);
router.post('/addplan',createPlan);
router.delete('/deleteplan/:id',deletePlan);
export default router;