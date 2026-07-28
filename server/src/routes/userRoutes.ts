import { Router } from 'express';
import {register} from '../controllers/userRegister'
import  {login} from '../controllers/userLogin';
import { plansSelect } from '../controllers/plansSelect';
import { authMiddleware } from '../middleware/authMiddleware';
import { exSelect } from '../controllers/exSelect';
import { createPlan } from '../controllers/createPlan';
import { deletePlan } from '../controllers/deletePlan';
import { alterPlan } from '../controllers/alterPlan';
import { getWorkouts } from '../controllers/getWorkouts';
import { createWorkout } from '../controllers/createWorkout';
import { deleteWorkout } from '../controllers/deleteWorkout';
import { getStats } from '../controllers/getStats';
const router = Router();
router.post('/login', login);
router.post('/users', register);
router.get('/me',authMiddleware, (req, res)=>{
    res.json({message: "Access granted!", userData: (req as any).user })
})
router.get('/exercises',exSelect);
router.get('/plans',plansSelect);
router.post('/addplan', authMiddleware, createPlan);
router.delete('/deleteplan/:id',authMiddleware, deletePlan);
router.put('/plans/:id',authMiddleware, alterPlan);
router.get('/workouts', authMiddleware, getWorkouts);
router.post('/workout', authMiddleware,createWorkout);
router.delete('/deleteWorkout/:id', authMiddleware, deleteWorkout)
router.get('/stats',authMiddleware, getStats);
export default router;