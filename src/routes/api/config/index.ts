import { Router, Response } from 'express';
import { prisma } from '../../../lib/prisma';
import { authenticate, AuthenticatedRequest } from '../../../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Get current configuration
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [smtpConfig, emailIdentity] = await Promise.all([
      prisma.sMTPConfig.findUnique({
        where: { userId: req.user!.id },
        select: { host: true, port: true, secure: true, username: true } // Don't return password
      }),
      prisma.emailIdentity.findUnique({
        where: { userId: req.user!.id }
      })
    ]);

    res.json({
      smtp: smtpConfig ? {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        user: smtpConfig.username
      } : null,
      identity: emailIdentity ? {
        from: {
          name: emailIdentity.name,
          email: emailIdentity.email
        },
        replyTo: emailIdentity.replyTo || '',
        signature: emailIdentity.signature || ''
      } : null
    });
  } catch (error) {
    console.error('Error fetching configuration:', error);
    res.status(500).json({ error: 'Failed to load configuration' });
  }
});

// Update SMTP configuration
router.post('/smtp', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { host, port, secure, username, password } = req.body;

    if (!host || !port || !username || !password) {
      res.status(400).json({ error: 'All SMTP fields are required' });
      return;
    }

    const smtpConfig = await prisma.sMTPConfig.upsert({
      where: { userId: req.user!.id },
      update: {
        host,
        port: parseInt(port.toString()),
        secure: Boolean(secure),
        username,
        password
      },
      create: {
        host,
        port: parseInt(port.toString()),
        secure: Boolean(secure),
        username,
        password,
        userId: req.user!.id
      },
      select: { host: true, port: true, secure: true, username: true } // Don't return password
    });

    res.json({
      success: true,
      data: smtpConfig
    });
  } catch (error) {
    console.error('Error updating SMTP configuration:', error);
    res.status(500).json({ error: 'Failed to update SMTP configuration' });
  }
});

// Update email identity
router.post('/identity', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, replyTo, signature } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    const emailIdentity = await prisma.emailIdentity.upsert({
      where: { userId: req.user!.id },
      update: {
        name,
        email,
        replyTo: replyTo || null,
        signature: signature || null
      },
      create: {
        name,
        email,
        replyTo: replyTo || null,
        signature: signature || null,
        userId: req.user!.id
      }
    });

    res.json({
      success: true,
      data: emailIdentity
    });
  } catch (error) {
    console.error('Error updating email identity:', error);
    res.status(500).json({ error: 'Failed to update email identity' });
  }
});

export default router;
