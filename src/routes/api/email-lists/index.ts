import { Router, Response } from 'express';
import { prisma } from '../../../lib/prisma';
import { authenticate, AuthenticatedRequest } from '../../../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Get all email lists for the authenticated user
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const emailLists = await prisma.emailList.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: 'desc' }
    });

    // Convert JSON emails back to array
    const listsWithEmails = emailLists.map((list: any) => ({
      ...list,
      emails: Array.isArray(list.emails) ? list.emails : []
    }));

    res.json(listsWithEmails);
  } catch (error) {
    console.error('Error fetching email lists:', error);
    res.status(500).json({ error: 'Failed to fetch email lists' });
  }
});

// Create a new email list
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, emails } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const emailList = await prisma.emailList.create({
      data: {
        name,
        description: description || '',
        emails: emails || [],
        userId: req.user!.id
      }
    });

    res.status(201).json({
      success: true,
      list: {
        ...emailList,
        emails: Array.isArray(emailList.emails) ? emailList.emails : []
      }
    });
  } catch (error) {
    console.error('Error creating email list:', error);
    res.status(500).json({ error: 'Failed to create email list' });
  }
});

// Update an email list
router.put('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, emails } = req.body;

    // Check if the list belongs to the user
    const existingList = await prisma.emailList.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existingList) {
      res.status(404).json({ error: 'Email list not found' });
      return;
    }

    const updatedList = await prisma.emailList.update({
      where: { id },
      data: {
        name: name || existingList.name,
        description: description !== undefined ? description : existingList.description,
        emails: emails !== undefined ? emails : existingList.emails,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      list: {
        ...updatedList,
        emails: Array.isArray(updatedList.emails) ? updatedList.emails : []
      }
    });
  } catch (error) {
    console.error('Error updating email list:', error);
    res.status(500).json({ error: 'Failed to update email list' });
  }
});

// Delete an email list
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if the list belongs to the user
    const existingList = await prisma.emailList.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existingList) {
      res.status(404).json({ error: 'Email list not found' });
      return;
    }

    await prisma.emailList.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting email list:', error);
    res.status(500).json({ error: 'Failed to delete email list' });
  }
});

export default router;
