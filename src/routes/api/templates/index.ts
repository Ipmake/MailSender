import { Router, Response } from 'express';
import { prisma } from '../../../lib/prisma';
import { authenticate, AuthenticatedRequest } from '../../../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Get all templates for the authenticated user
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const templates = await prisma.emailTemplate.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Create a new template
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, subject, text, html } = req.body;

    if (!name || !subject) {
      res.status(400).json({ error: 'Name and subject are required' });
      return;
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        text: text || '',
        html: html || '',
        userId: req.user!.id
      }
    });

    res.status(201).json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update a template
router.put('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, subject, text, html } = req.body;

    // Check if the template belongs to the user
    const existingTemplate = await prisma.emailTemplate.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existingTemplate) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    const updatedTemplate = await prisma.emailTemplate.update({
      where: { id },
      data: {
        name: name || existingTemplate.name,
        subject: subject || existingTemplate.subject,
        text: text !== undefined ? text : existingTemplate.text,
        html: html !== undefined ? html : existingTemplate.html,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      template: updatedTemplate
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete a template
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if the template belongs to the user
    const existingTemplate = await prisma.emailTemplate.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existingTemplate) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    await prisma.emailTemplate.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

export default router;
