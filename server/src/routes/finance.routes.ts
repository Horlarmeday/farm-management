import { Router } from 'express';
import { FinanceController } from '../controllers/FinanceController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/joiValidation.middleware';
import { financeValidations } from '../validations/finance.validations';

const router: Router = Router();
const financeController = new FinanceController();

// Apply authentication to all routes
router.use(authenticate);

// Financial Transaction Routes
router.post(
  '/transactions',
  validate({ body: financeValidations.createTransaction }),
  financeController.createTransaction,
);

router.get(
  '/transactions',
  validate({ query: financeValidations.getTransactions }),
  financeController.getTransactions,
);

router.get(
  '/transactions/:id',
  validate({ params: financeValidations.uuidParam }),
  financeController.getTransactionById,
);

router.put(
  '/transactions/:id',
  validate({
    params: financeValidations.uuidParam,
    body: financeValidations.updateTransaction,
  }),
  financeController.updateTransaction,
);

// Account Management Routes
router.post(
  '/accounts',
  validate({ body: financeValidations.createAccount }),
  financeController.createAccount,
);

router.get(
  '/accounts',
  validate({ query: financeValidations.getAccounts }),
  financeController.getAccounts,
);

router.get(
  '/accounts/:id',
  validate({ params: financeValidations.uuidParam }),
  financeController.getAccountById,
);

router.put(
  '/accounts/:id',
  validate({
    params: financeValidations.uuidParam,
    body: financeValidations.updateAccount,
  }),
  financeController.updateAccount,
);

// Invoice Management Routes
router.post(
  '/invoices',
  validate({ body: financeValidations.createInvoice }),
  financeController.createInvoice,
);

router.get(
  '/invoices',
  validate({ query: financeValidations.getInvoices }),
  financeController.getInvoices,
);

router.get(
  '/invoices/:id',
  validate({ params: financeValidations.uuidParam }),
  financeController.getInvoiceById,
);

router.put(
  '/invoices/:id',
  validate({
    params: financeValidations.uuidParam,
    body: financeValidations.updateInvoice,
  }),
  financeController.updateInvoice,
);

router.post(
  '/invoices/:id/send',
  validate({ params: financeValidations.uuidParam }),
  financeController.sendInvoice,
);

// Payment Management Routes
router.post(
  '/payments',
  validate({ body: financeValidations.recordPayment }),
  financeController.recordPayment,
);

router.get(
  '/payments',
  validate({ query: financeValidations.getPayments }),
  financeController.getPayments,
);

// Budget Management Routes
router.post(
  '/budgets',
  validate({ body: financeValidations.createBudget }),
  financeController.createBudget,
);

router.get(
  '/budgets',
  validate({ query: financeValidations.getBudgets }),
  financeController.getBudgets,
);

router.get(
  '/budgets/:id',
  validate({ params: financeValidations.uuidParam }),
  financeController.getBudgetById,
);

router.put(
  '/budgets/:id',
  validate({
    params: financeValidations.uuidParam,
    body: financeValidations.updateBudget,
  }),
  financeController.updateBudgetActuals,
);

// Financial Reporting Routes
router.get(
  '/reports/profit-loss',
  validate({ query: financeValidations.getProfitLossReport }),
  financeController.generateProfitLossReport,
);

router.get(
  '/reports/profit-loss/:id',
  validate({ params: financeValidations.uuidParam }),
  financeController.getProfitLossReportById,
);

router.get(
  '/reports/cash-flow',
  validate({ query: financeValidations.getCashFlowReport }),
  financeController.generateCashFlowReport,
);

// Analytics Routes
router.get(
  '/analytics/overview',
  validate({ query: financeValidations.getFinancialOverview }),
  financeController.getFinancialOverview,
);

export default router;
