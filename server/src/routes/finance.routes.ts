import { Router, Request, Response } from 'express';
import { FinanceController } from '../controllers/finance.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const financeController = new FinanceController();

// Test route (no auth required) - MUST be before auth middleware
router.get('/test', async (req: Request, res: Response) => {
  console.log('🧪 Test route hit');
  await financeController.testMethod(req, res);
});

// Apply authentication middleware to all other routes
router.use(authenticateToken);

// Financial Transaction Routes
router.post('/transactions', financeController.createTransaction.bind(financeController));
router.get('/transactions', financeController.getTransactions.bind(financeController));
router.get('/transactions/:id', financeController.getTransactionById.bind(financeController));
router.put('/transactions/:id', financeController.updateTransaction.bind(financeController));
router.delete('/transactions/:id', financeController.deleteTransaction.bind(financeController));

// Financial Category Routes
router.get('/categories', financeController.getCategories.bind(financeController));
router.post('/categories', financeController.createCategory.bind(financeController));
router.get('/categories/:id', financeController.getCategoryById.bind(financeController));
router.put('/categories/:id', financeController.updateCategory.bind(financeController));
router.delete('/categories/:id', financeController.deleteCategory.bind(financeController));

export default router;
