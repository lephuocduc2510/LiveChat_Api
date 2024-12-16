import express from 'express';
import path from 'path';
import authRouter from './auth';
const router = express.Router();

router.use('/auth' ,authRouter);


export default router;
