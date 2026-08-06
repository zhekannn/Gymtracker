import { Router } from 'express';
import {register} from '../controllers/userRegister.js'
import  {login} from '../controllers/userLogin.js';
import { plansSelect } from '../controllers/plansSelect.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { exSelect } from '../controllers/exSelect.js';
import { createPlan } from '../controllers/createPlan.js';
import { deletePlan } from '../controllers/deletePlan.js';
import { alterPlan } from '../controllers/alterPlan.js';
import { getWorkouts } from '../controllers/getWorkouts.js';
import { createWorkout } from '../controllers/createWorkout.js';
import { deleteWorkout } from '../controllers/deleteWorkout.js';
import { getStats } from '../controllers/getStats.js';
import { GeneratePlan } from '../controllers/generatePlan.js';
const router = Router();
router.post('/login', login);
router.post('/users', register);
router.get('/me',authMiddleware, (req, res)=>{
    res.json({message: "Access granted!", userData: (req as any).user })
})
router.get('/exercises',exSelect);
router.get('/plans',plansSelect);
router.post('/plans', authMiddleware, createPlan);
router.delete('/plans/:id',authMiddleware, deletePlan);
router.put('/plans/:id',authMiddleware, alterPlan);
router.get('/workouts', authMiddleware, getWorkouts);
router.post('/workouts', authMiddleware,createWorkout);
router.delete('/workouts/:id', authMiddleware, deleteWorkout)
router.get('/stats',authMiddleware, getStats);
router.post('/ai/generate-plan', authMiddleware, GeneratePlan);
export default router;