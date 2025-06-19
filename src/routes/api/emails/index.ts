import { Router, Response } from 'express';
import nodemailer from 'nodemailer';
import { prisma } from '../../../lib/prisma';
import { authenticate, AuthenticatedRequest } from '../../../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Send single email
router.post('/send', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || (!text && !html)) {
      res.status(400).json({ error: 'To, subject, and content (text or html) are required' });
      return;
    }

    // Get user's SMTP config
    const smtpConfig = await prisma.sMTPConfig.findUnique({
      where: { userId: req.user!.id }
    });

    if (!smtpConfig) {
      res.status(400).json({ error: 'SMTP configuration not found. Please configure SMTP settings first.' });
      return;
    }

    // Get user's email identity
    const emailIdentity = await prisma.emailIdentity.findUnique({
      where: { userId: req.user!.id }
    });

    if (!emailIdentity) {
      res.status(400).json({ error: 'Email identity not found. Please configure email identity first.' });
      return;
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"${emailIdentity.name}" <${emailIdentity.email}>`,
      to,
      subject,
      text,
      html,
      replyTo: emailIdentity.replyTo || emailIdentity.email,
    });

    // Log the email
    await prisma.emailLog.create({
      data: {
        recipient: to,
        subject,
        success: true,
        messageId: info.messageId,
        userId: req.user!.id
      }
    });

    res.json({
      success: true,
      data: { messageId: info.messageId }
    });
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Log failed email
    try {
      await prisma.emailLog.create({
        data: {
          recipient: req.body.to || 'unknown',
          subject: req.body.subject || 'unknown',
          success: false,
          error: (error as Error).message,
          userId: req.user!.id
        }
      });
    } catch (logError) {
      console.error('Error logging failed email:', logError);
    }

    res.status(500).json({ error: 'Failed to send email', details: (error as Error).message });
  }
});

// Send bulk emails
router.post('/send-bulk', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { recipients, subject, text, html } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      res.status(400).json({ error: 'Recipients array is required' });
      return;
    }

    if (!subject || (!text && !html)) {
      res.status(400).json({ error: 'Subject and content (text or html) are required' });
      return;
    }

    // Get user's SMTP config and email identity
    const [smtpConfig, emailIdentity] = await Promise.all([
      prisma.sMTPConfig.findUnique({ where: { userId: req.user!.id } }),
      prisma.emailIdentity.findUnique({ where: { userId: req.user!.id } })
    ]);

    if (!smtpConfig || !emailIdentity) {
      res.status(400).json({ error: 'SMTP configuration or email identity not found' });
      return;
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
    });

    const results = [];
    
    for (const recipient of recipients) {
      try {
        const info = await transporter.sendMail({
          from: `"${emailIdentity.name}" <${emailIdentity.email}>`,
          to: recipient,
          subject,
          text,
          html,
          replyTo: emailIdentity.replyTo || emailIdentity.email,
        });

        results.push({ email: recipient, success: true, messageId: info.messageId });
        
        // Log successful email
        await prisma.emailLog.create({
          data: {
            recipient,
            subject,
            success: true,
            messageId: info.messageId,
            userId: req.user!.id
          }
        });
      } catch (error) {
        results.push({ email: recipient, success: false, error: (error as Error).message });
        
        // Log failed email
        await prisma.emailLog.create({
          data: {
            recipient,
            subject,
            success: false,
            error: (error as Error).message,
            userId: req.user!.id
          }
        });
      }
    }

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error sending bulk emails:', error);
    res.status(500).json({ error: 'Failed to send bulk emails', details: (error as Error).message });
  }
});

// Test SMTP connection
router.post('/test-connection', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Get user's SMTP config
    const smtpConfig = await prisma.sMTPConfig.findUnique({
      where: { userId: req.user!.id }
    });

    if (!smtpConfig) {
      res.status(400).json({ error: 'SMTP configuration not found' });
      return;
    }

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
    });

    await transporter.verify();
    res.json({ success: true, message: 'SMTP connection successful' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'SMTP connection failed',
      details: (error as Error).message 
    });
  }
});

export default router;
