import { Router } from 'express';
import { userRouter } from './userRoutes.js';
import { thoughtRouter } from './thoughtRoutes.js';

const router = Router();

//set end points
router.use('/users', userRouter);
router.use('/thoughts', thoughtRouter);

export default router;