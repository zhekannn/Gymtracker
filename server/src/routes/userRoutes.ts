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
import { forgotPassword } from '../controllers/forgotPassword.js';
import { resetPassword } from '../controllers/resetPassword.js';
import { validateBody } from '../middleware/validateBody.js';
import { loginSchema, forgotPasswordSchema, generatePlanSchema } from '../validation/schemas.js';
import {
    loginIpLimiter, loginAccountLimiter, registrationLimiter,
    forgotIpLimiter, forgotAccountLimiter, resetLimiter,
    aiIpLimiter, aiDailyLimiter, aiBurstLimiter,
} from '../middleware/rateLimits.js';
const router = Router();
router.post('/login', loginIpLimiter, validateBody(loginSchema), loginAccountLimiter, login);
router.post('/users', registrationLimiter, register);
router.get('/me',authMiddleware, (req, res)=>{
    res.json({message: "Access granted!", userData: req.user })
})
router.get('/exercises',exSelect);
router.get('/plans',authMiddleware, plansSelect);
router.post('/plans', authMiddleware, createPlan);
router.delete('/plans/:id',authMiddleware, deletePlan);
router.put('/plans/:id',authMiddleware, alterPlan);
router.get('/workouts', authMiddleware, getWorkouts);
router.post('/workouts', authMiddleware,createWorkout);
router.delete('/workouts/:id', authMiddleware, deleteWorkout)
router.get('/stats',authMiddleware, getStats);
router.post('/ai/generate-plan', authMiddleware, validateBody(generatePlanSchema), aiIpLimiter, aiDailyLimiter, aiBurstLimiter, GeneratePlan);
router.post('/auth/forgot-password', forgotIpLimiter, validateBody(forgotPasswordSchema), forgotAccountLimiter, forgotPassword);
router.post('/auth/reset-password', resetLimiter, resetPassword);
export default router;
