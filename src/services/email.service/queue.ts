import { Queue } from 'bullmq';
import { EmailParam } from './types';
import { redis } from '../../redis/connection';



export const emailQueue = new Queue<EmailParam>('emailQueue', { connection: redis });