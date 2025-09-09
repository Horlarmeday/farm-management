import { InventoryCategory, PurchaseOrderStatus, TransactionType } from '@kuyash/shared';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { InventoryItem } from '../entities/InventoryItem';
import { InventoryTransaction } from '../entities/InventoryTransaction';
import { PurchaseOrder } from '../entities/PurchaseOrder';
import { PurchaseOrderItem } from '../entities/PurchaseOrderItem';
import { Supplier } from '../entities/Supplier';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class InventoryService {
  private inventoryItemRepository: Repository<InventoryItem>;
  private inventoryTransactionRepository: Repository<InventoryTransaction>;
  private supplierRepository: Repository<Supplier>;
  private purchaseOrderRepository: Repository<PurchaseOrder>;
  private purchaseOrderItemRepository: Repository<PurchaseOrderItem>;

  constructor() {
    this.inventoryItemRepository = AppDataSource.getRepository(InventoryItem);
    this.inventoryTransactionRepository = AppDataSource.getRepository(InventoryTransaction);
    this.supplierRepository = AppDataSource.getRepository(Supplier);
    this.purchaseOrderRepository = AppDataSource.getRepository(PurchaseOrder);
    this.purchaseOrderItemRepository = AppDataSource.getRepository(PurchaseOrderItem);
  }

  // Inventory Item Management
  async createInventoryItem(itemData: {
    name: string;
    description?: string;
    category: InventoryCategory;
    unit: string;
    currentStock: number;
    minimumStock: number;
    maximumStock?: number;
    unitCost: number;
    sellingPrice?: number;
    supplierId?: string;
    location?: string;
    batchNumber?: string;
    expiryDate?: Date;
    notes?: string;
    createdById: string;
  }): Promise<InventoryItem> {
    const item = this.inventoryItemRepository.create({
      ...itemData,
    });

    const savedItem = await this.inventoryItemRepository.save(item);

    // Create initial stock transaction
    if (itemData.currentStock > 0) {
      await this.recordTransaction({
        itemId: savedItem.id,
        type: TransactionType.PURCHASE,
        quantity: itemData.currentStock,
        unitCost: itemData.unitCost,
        reason: 'Initial stock',
        userId: itemData.createdById,
      });
    }

    return savedItem;
  }

  async getInventoryItems(filters?: {
    category?: InventoryCategory;
    lowStock?: boolean;
    location?: string;
    supplierId?: string;
    search?: string;
  }): Promise<InventoryItem[]> {
    const query = this.inventoryItemRepository
      .createQueryBuilder('item');

    if (filters?.category) {
      query.andWhere('item.category = :category', { category: filters.category });
    }

    if (filters?.lowStock) {
      query.andWhere('item.currentStock <= item.minimumStock');
    }

    if (filters?.location) {
      query.andWhere('item.location LIKE :location', { location: `%${filters.location}%` });
    }

    // Note: Supplier filtering removed as InventoryItem doesn't have direct supplier relationship
    // TODO: Implement supplier filtering through purchase orders if needed

    if (filters?.search) {
      query.andWhere('(item.name LIKE :search OR item.description LIKE :search)', {
        search: `%${filters.search}%`,
      });
    }

    return query.orderBy('item.name', 'ASC').getMany();
  }

  async getInventoryItemById(id: string): Promise<InventoryItem> {
    const item = await this.inventoryItemRepository.findOne({
      where: { id },
      relations: ['supplier', 'transactions'],
    });

    if (!item) {
      throw new NotFoundError('Inventory item not found');
    }

    return item;
  }

  async getInventoryItemByName(name: string): Promise<InventoryItem | null> {
    return this.inventoryItemRepository.findOne({
      where: { name },
      relations: ['supplier'],
    });
  }

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const item = await this.getInventoryItemById(id);
    Object.assign(item, updates);

    return this.inventoryItemRepository.save(item);
  }

  // Inventory Transaction Management
  async recordTransaction(transactionData: {
    itemId: string;
    type: TransactionType;
    quantity: number;
    unitCost?: number;
    reason: string;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
    userId: string;
  }): Promise<InventoryTransaction> {
    const item = await this.getInventoryItemById(transactionData.itemId);

    // Validate transaction
    if (
      transactionData.type === TransactionType.USAGE &&
      item.currentStock < transactionData.quantity
    ) {
      throw new BadRequestError(
        `Insufficient stock. Available: ${item.currentStock}, Required: ${transactionData.quantity}`,
      );
    }

    const transaction = this.inventoryTransactionRepository.create({
      ...transactionData,
      itemId: item.id,
      item,
      unitCost: transactionData.unitCost || item.unitCost,
      totalCost: transactionData.quantity * (transactionData.unitCost || item.unitCost || 0),
    });

    const savedTransaction = await this.inventoryTransactionRepository.save(transaction);

    // Update item stock
    const newStock =
      transactionData.type === TransactionType.PURCHASE
        ? item.currentStock + transactionData.quantity
        : item.currentStock - transactionData.quantity;

    await this.updateInventoryItem(item.id, {
      currentStock: newStock,
    });

    // Check for low stock alerts
    await this.checkLowStockAlert(item.id);

    return savedTransaction;
  }

  async getTransactions(
    itemId?: string,
    type?: TransactionType,
    startDate?: Date,
    endDate?: Date,
  ): Promise<InventoryTransaction[]> {
    const query = this.inventoryTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.item', 'item');

    if (itemId) {
      query.andWhere('transaction.itemId = :itemId', { itemId });
    }

    if (type) {
      query.andWhere('transaction.type = :type', { type });
    }

    if (startDate) {
      query.andWhere('transaction.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('transaction.createdAt <= :endDate', { endDate });
    }

    return query.orderBy('transaction.createdAt', 'DESC').getMany();
  }

  // Stock Adjustment
  async adjustStock(
    itemId: string,
    adjustmentData: {
      newQuantity: number;
      reason: string;
      notes?: string;
      userId: string;
    },
  ): Promise<InventoryItem> {
    const item = await this.getInventoryItemById(itemId);
    const difference = adjustmentData.newQuantity - item.currentStock;

    if (difference !== 0) {
      await this.recordTransaction({
        itemId,
        type: difference > 0 ? TransactionType.PURCHASE : TransactionType.ADJUSTMENT,
        quantity: Math.abs(difference),
        reason: `Stock adjustment: ${adjustmentData.reason}`,
        notes: adjustmentData.notes,
        userId: adjustmentData.userId,
      });
    }

    return this.getInventoryItemById(itemId);
  }

  // Supplier Management
  async createSupplier(supplierData: {
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    paymentTerms?: string;
    rating?: number;
    notes?: string;
    createdById: string;
  }): Promise<Supplier> {
    const supplier = this.supplierRepository.create({
      ...supplierData,
      isActive: true,
    });

    return this.supplierRepository.save(supplier);
  }

  async getSuppliers(filters?: {
    active?: boolean;
    city?: string;
    country?: string;
    search?: string;
  }): Promise<Supplier[]> {
    const query = this.supplierRepository.createQueryBuilder('supplier');

    if (filters?.active !== undefined) {
      query.andWhere('supplier.isActive = :active', { active: filters.active });
    }

    if (filters?.city) {
      query.andWhere('supplier.city LIKE :city', { city: `%${filters.city}%` });
    }

    if (filters?.country) {
      query.andWhere('supplier.country LIKE :country', { country: `%${filters.country}%` });
    }

    if (filters?.search) {
      query.andWhere('(supplier.name LIKE :search OR supplier.contactPerson LIKE :search)', {
        search: `%${filters.search}%`,
      });
    }

    return query.orderBy('supplier.name', 'ASC').getMany();
  }

  async getSupplierById(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
      relations: ['inventoryItems', 'purchaseOrders'],
    });

    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }

    return supplier;
  }

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
    const supplier = await this.getSupplierById(id);
    Object.assign(supplier, updates);
    return this.supplierRepository.save(supplier);
  }

  // Purchase Order Management
  async createPurchaseOrder(orderData: {
    supplierId: string;
    orderDate: Date;
    expectedDeliveryDate?: Date;
    notes?: string;
    items: Array<{
      itemId: string;
      quantity: number;
      unitCost: number;
      notes?: string;
    }>;
    createdById: string;
  }): Promise<PurchaseOrder> {
    const supplier = await this.getSupplierById(orderData.supplierId);

    // Calculate totals
    const subtotal = orderData.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    const taxAmount = subtotal * 0.1; // 10% tax - could be configurable
    const totalAmount = subtotal + taxAmount;

    const purchaseOrder = this.purchaseOrderRepository.create({
      supplierId: supplier.id,
      supplier,
      orderDate: orderData.orderDate,
      expectedDeliveryDate: orderData.expectedDeliveryDate,
      totalAmount,
      status: PurchaseOrderStatus.DRAFT,
      notes: orderData.notes,
    });

    const savedOrder = await this.purchaseOrderRepository.save(purchaseOrder);

    // Create order items
    for (const itemData of orderData.items) {
      const item = await this.getInventoryItemById(itemData.itemId);

      const orderItem = this.purchaseOrderItemRepository.create({
        purchaseOrder: savedOrder,
        purchaseOrderId: savedOrder.id,
        itemId: item.id,
        item,
        quantity: itemData.quantity,
        unitPrice: itemData.unitCost,
        totalPrice: itemData.quantity * itemData.unitCost,
        notes: itemData.notes,
      });

      await this.purchaseOrderItemRepository.save(orderItem);
    }

    return this.getPurchaseOrderById(savedOrder.id);
  }

  async getPurchaseOrders(filters?: {
    status?: PurchaseOrderStatus;
    supplierId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<PurchaseOrder[]> {
    const query = this.purchaseOrderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.supplier', 'supplier')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.item', 'inventoryItem');

    if (filters?.status) {
      query.andWhere('order.status = :status', { status: filters.status });
    }

    if (filters?.supplierId) {
      query.andWhere('order.supplierId = :supplierId', { supplierId: filters.supplierId });
    }

    if (filters?.startDate) {
      query.andWhere('order.orderDate >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('order.orderDate <= :endDate', { endDate: filters.endDate });
    }

    return query.orderBy('order.orderDate', 'DESC').getMany();
  }

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder> {
    const order = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: ['supplier', 'items', 'items.item'],
    });

    if (!order) {
      throw new NotFoundError('Purchase order not found');
    }

    return order;
  }

  async receivePurchaseOrder(
    orderId: string,
    receiptData: {
      receivedDate: Date;
      items: Array<{
        itemId: string;
        quantityReceived: number;
        qualityNotes?: string;
      }>;
      totalCostPaid: number;
      paymentMethod: string;
      notes?: string;
      receivedById: string;
    },
  ): Promise<PurchaseOrder> {
    const order = await this.getPurchaseOrderById(orderId);

    if (order.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestError('Order is not in draft status');
    }

    // Update order status
    order.status = PurchaseOrderStatus.RECEIVED;
    order.actualDeliveryDate = receiptData.receivedDate;
    order.notes = receiptData.notes;

    await this.purchaseOrderRepository.save(order);

    // Process received items
    for (const receivedItem of receiptData.items) {
      const orderItem = order.items.find((item) => item.itemId === receivedItem.itemId);
      if (orderItem) {
        // Update inventory
        await this.recordTransaction({
          itemId: receivedItem.itemId,
          type: TransactionType.PURCHASE,
          quantity: receivedItem.quantityReceived,
          unitCost: orderItem.unitPrice,
          reason: `Purchase order receipt - PO#${order.id}`,
          referenceType: 'purchase_order',
          referenceId: order.id,
          notes: receivedItem.qualityNotes,
          userId: receiptData.receivedById,
        });
      }
    }

    return order;
  }

  // Alerts and Notifications
  private async checkLowStockAlert(itemId: string): Promise<void> {
    const item = await this.getInventoryItemById(itemId);

    if (item.currentStock <= item.minimumStock) {
      // Log low stock alert - notification service can be called separately
      console.log(
        `Low stock alert: ${item.name} is running low. Current stock: ${item.currentStock} ${item.unit}, Minimum: ${item.minimumStock} ${item.unit}`,
      );
    }
  }

  async checkExpiringItems(daysAhead: number = 30): Promise<InventoryItem[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const expiringItems = await this.inventoryItemRepository
      .createQueryBuilder('item')
      .where('item.expiryDate IS NOT NULL')
      .andWhere('item.expiryDate <= :futureDate', { futureDate })
      .andWhere('item.currentStock > 0')
      .getMany();

    // Log expiring items - notification service can be called separately
    for (const item of expiringItems) {
      const daysUntilExpiry = Math.ceil(
        (item.expiryDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
      );
      console.log(
        `Item expiring soon: ${item.name} expires in ${daysUntilExpiry} days (${item.expiryDate!.toDateString()})`,
      );
    }

    return expiringItems;
  }

  // Analytics and Reporting
  async getInventoryValuation(): Promise<{
    totalValue: number;
    valueByCategory: Record<InventoryCategory, number>;
    lowStockItems: number;
    expiringItems: number;
    topValueItems: InventoryItem[];
  }> {
    const items = await this.getInventoryItems();
    const lowStockItems = await this.getInventoryItems({ lowStock: true });
    const expiringItems = await this.checkExpiringItems();

    const totalValue = items.reduce((sum, item) => {
      const itemValue = item.currentStock * (item.unitCost || 0);
      return sum + itemValue;
    }, 0);

    const valueByCategory = items.reduce(
      (acc, item) => {
        const itemValue = item.currentStock * (item.unitCost || 0);
        acc[item.category] = (acc[item.category] || 0) + itemValue;
        return acc;
      },
      {} as Record<InventoryCategory, number>,
    );

    const topValueItems = items
      .map((item) => ({
        ...item,
        calculatedValue: item.currentStock * (item.unitCost || 0),
      }))
      .sort((a, b) => b.calculatedValue - a.calculatedValue)
      .slice(0, 10)
      .map((item) => {
        const { calculatedValue, ...rest } = item;
        return rest as InventoryItem;
      });

    return {
      totalValue,
      valueByCategory,
      lowStockItems: lowStockItems.length,
      expiringItems: expiringItems.length,
      topValueItems,
    };
  }

  async getStockMovementReport(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalTransactions: number;
    stockIn: number;
    stockOut: number;
    valueIn: number;
    valueOut: number;
    topMovedItems: Array<{
      item: InventoryItem;
      totalMovement: number;
      totalValue: number;
    }>;
  }> {
    const transactions = await this.getTransactions(undefined, undefined, startDate, endDate);

    const totalTransactions = transactions.length;
    const stockIn = transactions
      .filter((t) => t.type === TransactionType.PURCHASE)
      .reduce((sum, t) => sum + t.quantity, 0);
    const stockOut = transactions
      .filter((t) => t.type === TransactionType.ADJUSTMENT)
      .reduce((sum, t) => sum + t.quantity, 0);
    const valueIn = transactions
      .filter((t) => t.type === TransactionType.PURCHASE)
      .reduce((sum, t) => sum + (t.totalCost || 0), 0);
    const valueOut = transactions
      .filter((t) => t.type === TransactionType.ADJUSTMENT)
      .reduce((sum, t) => sum + (t.totalCost || 0), 0);

    // Calculate top moved items
    const itemMovements = transactions.reduce(
      (acc, transaction) => {
        const itemId = transaction.itemId;
        if (!acc[itemId]) {
          acc[itemId] = {
            item: transaction.item,
            totalMovement: 0,
            totalValue: 0,
          };
        }
        acc[itemId].totalMovement += transaction.quantity;
        acc[itemId].totalValue += transaction.totalCost || 0;
        return acc;
      },
      {} as Record<string, any>,
    );

    const topMovedItems = Object.values(itemMovements)
      .sort((a: any, b: any) => b.totalMovement - a.totalMovement)
      .slice(0, 10);

    return {
      totalTransactions,
      stockIn,
      stockOut,
      valueIn,
      valueOut,
      topMovedItems,
    };
  }

  async generateReorderReport(): Promise<
    Array<{
      item: InventoryItem;
      suggestedOrderQuantity: number;
      estimatedCost: number;
      preferredSupplier: string | null;
    }>
  > {
    const lowStockItems = await this.getInventoryItems({ lowStock: true });
    const report = [];

    for (const item of lowStockItems) {
      const suggestedOrderQuantity = item.maximumStock
        ? item.maximumStock - item.currentStock
        : item.minimumStock * 2;

      const estimatedCost = suggestedOrderQuantity * (item.unitCost || 0);
      // Note: supplier relationship doesn't exist on InventoryItem entity
      const preferredSupplier = null;

      report.push({
        item,
        suggestedOrderQuantity,
        estimatedCost,
        preferredSupplier,
      });
    }

    return report.sort((a, b) => b.estimatedCost - a.estimatedCost);
  }
}
