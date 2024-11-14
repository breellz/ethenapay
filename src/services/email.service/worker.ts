// emailWorker.ts
import { Worker } from 'bullmq';
import { sendEmail } from './mailer';
import { EmailParam } from './types';
import { redis } from '../../redis/connection';

const emailWorker = new Worker<EmailParam>('emailQueue', async job => {
  try {
    await sendEmail(job.data);
    console.log(`Email sent to ${job.data.to}`);
  } catch (error) {
    console.error(`Failed to send email to ${job.data.to}:`, error);
  }
}, { connection: redis });

emailWorker.on('completed', job => {
  console.log(`Job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});