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

// Send bulk emails with streaming progress
router.post('/send-bulk-stream', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

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

    const results: Array<{email: string, success: boolean, messageId?: string, error?: string}> = [];
    const total = recipients.length;
    let processed = 0;
    let successful = 0;
    let failed = 0;

    // Send initial progress
    res.write(`data: ${JSON.stringify({ 
      type: 'progress', 
      processed: 0, 
      total, 
      percentage: 0,
      successful: 0,
      failed: 0
    })}

`);

    // Process each recipient
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

        successful++;
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
        failed++;
        const errorMessage = (error as Error).message;
        results.push({ email: recipient, success: false, error: errorMessage });
        
        // Log failed email
        try {
          await prisma.emailLog.create({
            data: {
              recipient,
              subject,
              success: false,
              error: errorMessage,
              userId: req.user!.id
            }
          });
        } catch (logError) {
          console.error('Error logging failed email:', logError);
        }
      }

      processed++;
      const percentage = Math.round((processed / total) * 100);

      // Send progress update
      res.write(`data: ${JSON.stringify({ 
        type: 'progress', 
        processed,
        total,
        percentage,
        successful,
        failed,
        currentEmail: recipient,
        lastResult: results[results.length - 1]
      })}\n\n`);

      // Small delay to prevent overwhelming the SMTP server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Send completion message
    res.write(`data: ${JSON.stringify({ 
      type: 'complete', 
      processed,
      total,
      percentage: 100,
      successful,
      failed,
      results
    })}\n\n`);

    res.end();

  } catch (error) {
    console.error('Error in bulk email stream:', error);
    
    // Send error event
    res.write(`data: ${JSON.stringify({ 
      type: 'error', 
      error: 'Failed to send bulk emails',
      details: (error as Error).message 
    })}\n\n`);
    
    res.end();
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
