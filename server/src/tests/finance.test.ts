import { InvoiceStatus, PaymentMethod, TransactionType } from '../../../shared/src/types';
import request from 'supertest';
import { app } from '../app';
import { TestData, TestUtils } from './utils';

describe('Finance API', () => {
  let testData: TestData;

  beforeEach(async () => {
    await TestUtils.cleanupTestData();
    testData = await TestUtils.createTestData();
  });

  afterEach(async () => {
    await TestUtils.cleanupTestData();
  });

  describe('POST /api/finance/transactions', () => {
    it('should create a new transaction successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const transactionData = {
        type: TransactionType.INCOME,
        category: 'egg_sales',
        description: 'Egg sales for January',
        amount: 1500.0,
        date: '2024-01-20',
        paymentMethod: PaymentMethod.CASH,
        referenceNumber: 'TXN001',
        notes: 'Cash payment received',
      };

      const response = await authReq
        .post('/api/finance/transactions')
        .send(transactionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Transaction created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.type).toBe(transactionData.type);
      expect(response.body.data.amount).toBe(transactionData.amount);
      expect(response.body.data.description).toBe(transactionData.description);
    });

    it('should create expense transaction successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const transactionData = {
        type: TransactionType.EXPENSE,
        category: 'feed_purchase',
        description: 'Feed purchase from supplier',
        amount: 750.0,
        date: '2024-01-20',
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        supplierId: 'supplier-123',
        notes: 'Monthly feed purchase',
      };

      const response = await authReq
        .post('/api/finance/transactions')
        .send(transactionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe(transactionData.type);
      expect(response.body.data.amount).toBe(transactionData.amount);
    });

    it('should fail to create transaction with invalid data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const transactionData = {
        type: 'invalid-type',
        amount: -100,
        date: 'invalid-date',
      };

      const response = await authReq
        .post('/api/finance/transactions')
        .send(transactionData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const transactionData = {
        type: TransactionType.INCOME,
        category: 'sales',
        description: 'Test transaction',
        amount: 100.0,
        date: '2024-01-20',
      };

      const response = await request(app)
        .post('/api/finance/transactions')
        .send(transactionData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/finance/transactions', () => {
    it('should get all transactions with pagination', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/finance/transactions')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('transactions');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.transactions)).toBe(true);
    });

    it('should filter transactions by type', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/finance/transactions')
        .query({ type: TransactionType.INCOME })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(
        response.body.data.transactions.every((txn: any) => txn.type === TransactionType.INCOME),
      ).toBe(true);
    });

    it('should filter transactions by date range', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      const response = await authReq
        .get('/api/finance/transactions')
        .query({ startDate, endDate })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should filter transactions by category', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/finance/transactions')
        .query({ category: 'feed_purchase' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should search transactions by description', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/finance/transactions')
        .query({ search: 'feed' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/finance/transactions/:id', () => {
    it('should get transaction by ID', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      // First create a transaction
      const transactionData = {
        type: TransactionType.INCOME,
        category: 'sales',
        description: 'Test transaction',
        amount: 100.0,
        date: '2024-01-20',
      };

      const createResponse = await authReq.post('/api/finance/transactions').send(transactionData);

      const transactionId = createResponse.body.data.id;

      const response = await authReq.get(`/api/finance/transactions/${transactionId}`).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(transactionId);
      expect(response.body.data.description).toBe(transactionData.description);
    });

    it('should return 404 for non-existent transaction', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/finance/transactions/non-existent-id').expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/finance/transactions/:id', () => {
    it('should update transaction successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      // First create a transaction
      const transactionData = {
        type: TransactionType.INCOME,
        category: 'sales',
        description: 'Test transaction',
        amount: 100.0,
        date: '2024-01-20',
      };

      const createResponse = await authReq.post('/api/finance/transactions').send(transactionData);

      const transactionId = createResponse.body.data.id;

      const updateData = {
        description: 'Updated transaction description',
        amount: 150.0,
        notes: 'Updated notes',
      };

      const response = await authReq
        .put(`/api/finance/transactions/${transactionId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.amount).toBe(updateData.amount);
      expect(response.body.data.notes).toBe(updateData.notes);
    });

    it('should fail to update with invalid data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      // First create a transaction
      const transactionData = {
        type: TransactionType.INCOME,
        category: 'sales',
        description: 'Test transaction',
        amount: 100.0,
        date: '2024-01-20',
      };

      const createResponse = await authReq.post('/api/finance/transactions').send(transactionData);

      const transactionId = createResponse.body.data.id;

      const updateData = {
        amount: -100,
        type: 'invalid-type',
      };

      const response = await authReq
        .put(`/api/finance/transactions/${transactionId}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/finance/transactions/:id', () => {
    it('should soft delete transaction successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      // First create a transaction
      const transactionData = {
        type: TransactionType.INCOME,
        category: 'sales',
        description: 'Test transaction',
        amount: 100.0,
        date: '2024-01-20',
      };

      const createResponse = await authReq.post('/api/finance/transactions').send(transactionData);

      const transactionId = createResponse.body.data.id;

      const response = await authReq
        .delete(`/api/finance/transactions/${transactionId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
    });
  });

  describe('POST /api/finance/invoices', () => {
    it('should create a new invoice successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const invoiceData = {
        invoiceNumber: 'INV001',
        customerName: 'ABC Restaurant',
        customerEmail: 'abc@restaurant.com',
        customerPhone: '+1234567890',
        customerAddress: '123 Restaurant St',
        issueDate: '2024-01-20',
        dueDate: '2024-02-20',
        items: [
          {
            description: 'Grade A Eggs',
            quantity: 100,
            unitPrice: 2.5,
            total: 250.0,
          },
          {
            description: 'Chicken Meat',
            quantity: 20,
            unitPrice: 15.0,
            total: 300.0,
          },
        ],
        subtotal: 550.0,
        taxRate: 10,
        taxAmount: 55.0,
        totalAmount: 605.0,
        notes: 'Payment terms: Net 30 days',
      };

      const response = await authReq.post('/api/finance/invoices').send(invoiceData).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Invoice created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.invoiceNumber).toBe(invoiceData.invoiceNumber);
      expect(response.body.data.customerName).toBe(invoiceData.customerName);
      expect(response.body.data.totalAmount).toBe(invoiceData.totalAmount);
      expect(response.body.data.status).toBe(InvoiceStatus.PENDING);
    });

    it('should fail to create invoice with duplicate invoice number', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const invoiceData = {
        invoiceNumber: 'INV001',
        customerName: 'Test Customer',
        issueDate: '2024-01-20',
        dueDate: '2024-02-20',
        items: [{ description: 'Test Item', quantity: 1, unitPrice: 100, total: 100 }],
        subtotal: 100,
        totalAmount: 100,
      };

      // Create first invoice
      await authReq.post('/api/finance/invoices').send(invoiceData);

      // Try to create duplicate
      const response = await authReq.post('/api/finance/invoices').send(invoiceData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should fail to create invoice with invalid data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const invoiceData = {
        invoiceNumber: '',
        customerName: '',
        totalAmount: -100,
        items: [],
      };

      const response = await authReq.post('/api/finance/invoices').send(invoiceData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/finance/invoices', () => {
    it('should get all invoices with pagination', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/finance/invoices')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('invoices');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.invoices)).toBe(true);
    });

    it('should filter invoices by status', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/finance/invoices')
        .query({ status: InvoiceStatus.PENDING })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(
        response.body.data.invoices.every((inv: any) => inv.status === InvoiceStatus.PENDING),
      ).toBe(true);
    });

    it('should search invoices by customer name', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/finance/invoices')
        .query({ search: 'Restaurant' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('PUT /api/finance/invoices/:id/status', () => {
    it('should update invoice status successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      // First create an invoice
      const invoiceData = {
        invoiceNumber: 'INV002',
        customerName: 'Test Customer',
        issueDate: '2024-01-20',
        dueDate: '2024-02-20',
        items: [{ description: 'Test Item', quantity: 1, unitPrice: 100, total: 100 }],
        subtotal: 100,
        totalAmount: 100,
      };

      const createResponse = await authReq.post('/api/finance/invoices').send(invoiceData);

      const invoiceId = createResponse.body.data.id;

      const response = await authReq
        .put(`/api/finance/invoices/${invoiceId}/status`)
        .send({ status: InvoiceStatus.PAID })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(InvoiceStatus.PAID);
    });

    it('should fail with invalid status', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      // First create an invoice
      const invoiceData = {
        invoiceNumber: 'INV003',
        customerName: 'Test Customer',
        issueDate: '2024-01-20',
        dueDate: '2024-02-20',
        items: [{ description: 'Test Item', quantity: 1, unitPrice: 100, total: 100 }],
        subtotal: 100,
        totalAmount: 100,
      };

      const createResponse = await authReq.post('/api/finance/invoices').send(invoiceData);

      const invoiceId = createResponse.body.data.id;

      const response = await authReq
        .put(`/api/finance/invoices/${invoiceId}/status`)
        .send({ status: 'invalid-status' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/finance/analytics', () => {
    it('should get financial analytics', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/finance/analytics').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalRevenue');
      expect(response.body.data).toHaveProperty('totalExpenses');
      expect(response.body.data).toHaveProperty('netIncome');
      expect(response.body.data).toHaveProperty('revenueByCategory');
      expect(response.body.data).toHaveProperty('expensesByCategory');
      expect(response.body.data).toHaveProperty('monthlyTrends');
    });

    it('should filter analytics by date range', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      const response = await authReq
        .get('/api/finance/analytics')
        .query({ startDate, endDate })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/finance/profit-loss', () => {
    it('should get profit and loss report', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/finance/profit-loss').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('revenue');
      expect(response.body.data).toHaveProperty('expenses');
      expect(response.body.data).toHaveProperty('grossProfit');
      expect(response.body.data).toHaveProperty('netProfit');
      expect(response.body.data).toHaveProperty('profitMargin');
    });

    it('should filter profit loss by period', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/finance/profit-loss')
        .query({ period: 'monthly', year: 2024, month: 1 })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/finance/cash-flow', () => {
    it('should get cash flow report', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/finance/cash-flow').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('cashInflows');
      expect(response.body.data).toHaveProperty('cashOutflows');
      expect(response.body.data).toHaveProperty('netCashFlow');
      expect(response.body.data).toHaveProperty('openingBalance');
      expect(response.body.data).toHaveProperty('closingBalance');
    });
  });

  describe('GET /api/finance/budget', () => {
    it('should get budget analysis', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/finance/budget').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('budgetVsActual');
      expect(response.body.data).toHaveProperty('variance');
      expect(response.body.data).toHaveProperty('categories');
    });
  });

  describe('GET /api/finance/receivables', () => {
    it('should get accounts receivable report', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/finance/receivables').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalReceivables');
      expect(response.body.data).toHaveProperty('overdueAmount');
      expect(response.body.data).toHaveProperty('agingReport');
      expect(response.body.data).toHaveProperty('topDebtors');
    });
  });

  describe('POST /api/finance/payments', () => {
    it('should record payment successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      // First create an invoice
      const invoiceData = {
        invoiceNumber: 'INV004',
        customerName: 'Test Customer',
        issueDate: '2024-01-20',
        dueDate: '2024-02-20',
        items: [{ description: 'Test Item', quantity: 1, unitPrice: 100, total: 100 }],
        subtotal: 100,
        totalAmount: 100,
      };

      const invoiceResponse = await authReq.post('/api/finance/invoices').send(invoiceData);

      const invoiceId = invoiceResponse.body.data.id;

      const paymentData = {
        invoiceId,
        amount: 100.0,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        paymentDate: '2024-01-25',
        referenceNumber: 'PAY001',
        notes: 'Full payment received',
      };

      const response = await authReq.post('/api/finance/payments').send(paymentData).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(paymentData.amount);
      expect(response.body.data.paymentMethod).toBe(paymentData.paymentMethod);
    });
  });

  describe('Permission Tests', () => {
    it('should allow manager to create transactions', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.managerUser.accessToken);

      const transactionData = {
        type: TransactionType.INCOME,
        category: 'sales',
        description: 'Manager transaction',
        amount: 200.0,
        date: '2024-01-20',
      };

      const response = await authReq
        .post('/api/finance/transactions')
        .send(transactionData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should allow worker to view transactions', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.workerUser.accessToken);

      const response = await authReq.get('/api/finance/transactions').expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should prevent worker from deleting transactions', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.workerUser.accessToken);

      // First create a transaction as admin
      const adminReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);
      const transactionData = {
        type: TransactionType.INCOME,
        category: 'sales',
        description: 'Test transaction',
        amount: 100.0,
        date: '2024-01-20',
      };

      const createResponse = await adminReq.post('/api/finance/transactions').send(transactionData);

      const transactionId = createResponse.body.data.id;

      const response = await authReq
        .delete(`/api/finance/transactions/${transactionId}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('permission');
    });
  });
});
