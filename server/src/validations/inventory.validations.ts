import { commonSchemas } from '@/middleware/joiValidation.middleware';
import Joi from 'joi';

export const inventoryValidations = {
  // List inventory items
  list: {
    query: commonSchemas.pagination.keys({
      category: Joi.string().valid('feed', 'medicine', 'equipment', 'tools', 'other').optional(),
      supplier: Joi.string().optional(),
      lowStock: Joi.boolean().optional(),
      expiring: Joi.boolean().optional(),
    }),
  },

  // Create inventory item
  create: {
    body: Joi.object({
      name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Name is required',
      }),
      category: Joi.string()
        .valid('feed', 'medicine', 'equipment', 'tools', 'other')
        .required()
        .messages({
          'any.only': 'Category must be one of: feed, medicine, equipment, tools, other',
          'any.required': 'Category is required',
        }),
      description: Joi.string().max(500).optional(),
      unit: Joi.string().max(20).required().messages({
        'string.max': 'Unit cannot exceed 20 characters',
        'any.required': 'Unit is required',
      }),
      currentStock: Joi.number().min(0).required().messages({
        'number.min': 'Current stock cannot be negative',
        'any.required': 'Current stock is required',
      }),
      reorderLevel: Joi.number().min(0).required().messages({
        'number.min': 'Reorder level cannot be negative',
        'any.required': 'Reorder level is required',
      }),
      unitPrice: Joi.number().min(0).required().messages({
        'number.min': 'Unit price cannot be negative',
        'any.required': 'Unit price is required',
      }),
      supplier: Joi.string().max(100).optional(),
      expiryDate: Joi.date().iso().optional(),
      location: Joi.string().max(100).optional(),
      isActive: Joi.boolean().default(true),
    }),
  },

  // Get inventory item by ID
  getById: {
    params: commonSchemas.uuidParam,
  },

  // Update inventory item
  update: {
    params: commonSchemas.uuidParam,
    body: Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      category: Joi.string().valid('feed', 'medicine', 'equipment', 'tools', 'other').optional(),
      description: Joi.string().max(500).optional(),
      unit: Joi.string().max(20).optional(),
      currentStock: Joi.number().min(0).optional(),
      reorderLevel: Joi.number().min(0).optional(),
      unitPrice: Joi.number().min(0).optional(),
      supplier: Joi.string().max(100).optional(),
      expiryDate: Joi.date().iso().optional(),
      location: Joi.string().max(100).optional(),
      isActive: Joi.boolean().optional(),
    }),
  },

  // Delete inventory item
  delete: {
    params: commonSchemas.uuidParam,
  },

  // Stock adjustment
  adjustStock: {
    params: commonSchemas.uuidParam,
    body: Joi.object({
      quantity: Joi.number().required().messages({
        'any.required': 'Quantity is required',
      }),
      type: Joi.string().valid('in', 'out', 'adjustment').required().messages({
        'any.only': 'Type must be one of: in, out, adjustment',
        'any.required': 'Type is required',
      }),
      reason: Joi.string().max(200).required().messages({
        'string.max': 'Reason cannot exceed 200 characters',
        'any.required': 'Reason is required',
      }),
      reference: Joi.string().max(100).optional(),
    }),
  },

  // Bulk import
  bulkImport: {
    body: Joi.object({
      items: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            category: Joi.string()
              .valid('feed', 'medicine', 'equipment', 'tools', 'other')
              .required(),
            unit: Joi.string().required(),
            currentStock: Joi.number().min(0).required(),
            reorderLevel: Joi.number().min(0).required(),
            unitPrice: Joi.number().min(0).required(),
            supplier: Joi.string().optional(),
            location: Joi.string().optional(),
          }),
        )
        .min(1)
        .required()
        .messages({
          'array.min': 'At least one item is required',
          'any.required': 'Items array is required',
        }),
    }),
  },

  // Get low stock items
  lowStock: {
    query: Joi.object({
      limit: Joi.number().integer().min(1).max(100).default(10),
    }),
  },

  // Get expiring items
  expiring: {
    query: Joi.object({
      days: Joi.number().integer().min(1).default(30),
      limit: Joi.number().integer().min(1).max(100).default(10),
    }),
  },

  // Export inventory
  export: {
    query: Joi.object({
      format: Joi.string().valid('csv', 'excel', 'pdf').default('csv'),
      category: Joi.string().valid('feed', 'medicine', 'equipment', 'tools', 'other').optional(),
      includeInactive: Joi.boolean().default(false),
    }),
  },
};
