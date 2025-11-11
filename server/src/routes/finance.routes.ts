import { Request, Response, Router } from 'express';
import { FarmRole } from '../../../shared/src/types';
import { FinanceController } from '../controllers/finance.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireFarmAccessWithRole } from '../middleware/farm-auth.middleware';

const router = Router();
const financeController = new FinanceController();

// Test route (no auth required) - MUST be before auth middleware
router.get('/test', async (req: Request, res: Response) => {
  console.log('🧪 Test route hit');
  await financeController.testMethod(req, res);
});

// Apply authentication middleware to all other routes
router.use(authenticate);

// Apply farm access middleware - Finance operations require MANAGER or OWNER role
router.use(requireFarmAccessWithRole([FarmRole.MANAGER, FarmRole.OWNER]));

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

// Financial Summary Routes
router.get('/summary', financeController.getFinanceSummary.bind(financeController));
router.get('/dashboard', financeController.getFinanceSummary.bind(financeController)); // Alias for dashboard

// Account Management Routes
router.post('/accounts', financeController.createAccount.bind(financeController));
router.get('/accounts', financeController.getAccounts.bind(financeController));
router.get('/accounts/:id', financeController.getAccountById.bind(financeController));
router.put('/accounts/:id', financeController.updateAccount.bind(financeController));
router.delete('/accounts/:id', financeController.deleteAccount.bind(financeController));
router.get('/accounts/:id/balance', financeController.getAccountBalance.bind(financeController));

// Invoice Management Routes
router.post('/invoices', financeController.createInvoice.bind(financeController));
router.get('/invoices', financeController.getInvoices.bind(financeController));
router.get('/invoices/:id', financeController.getInvoiceById.bind(financeController));
router.put('/invoices/:id', financeController.updateInvoice.bind(financeController));
router.delete('/invoices/:id', financeController.deleteInvoice.bind(financeController));
router.post('/invoices/:id/send', financeController.sendInvoice.bind(financeController));
router.post('/invoices/:id/mark-paid', financeController.markInvoiceAsPaid.bind(financeController));
router.post(
  '/invoices/:id/mark-overdue',
  financeController.markInvoiceAsOverdue.bind(financeController),
);

// Payment Management Routes
router.post('/payments', financeController.recordPayment.bind(financeController));
router.get('/payments', financeController.getPayments.bind(financeController));
router.get('/payments/:id', financeController.getPaymentById.bind(financeController));
router.put('/payments/:id', financeController.updatePayment.bind(financeController));
router.delete('/payments/:id', financeController.deletePayment.bind(financeController));

// Receipt Management Routes
router.post('/receipts', financeController.createReceipt.bind(financeController));
router.get('/receipts', financeController.getReceipts.bind(financeController));
router.get('/receipts/:id', financeController.getReceiptById.bind(financeController));

// Budget Management Routes
router.post('/budgets', financeController.createBudget.bind(financeController));
router.get('/budgets', financeController.getBudgets.bind(financeController));
router.get('/budgets/:id', financeController.getBudgetById.bind(financeController));
router.post(
  '/budgets/:id/update-actuals',
  financeController.updateBudgetActuals.bind(financeController),
);

// Analytics & Reporting Routes
router.get('/analytics/cash-flow', financeController.getCashFlowAnalysis.bind(financeController));
router.get(
  '/analytics/breakdown',
  financeController.getIncomeExpenseBreakdown.bind(financeController),
);

// Report Generation Routes
router.post(
  '/reports/profit-loss',
  financeController.generateProfitLossReport.bind(financeController),
);

export default router;
