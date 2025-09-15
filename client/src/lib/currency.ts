/**
 * Currency formatting utilities for Nigerian Naira (₦)
 */

/**
 * Formats a number as Nigerian Naira currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string with ₦ symbol
 */
export function formatNaira(
  amount: number | string | null | undefined,
  options: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const {
    showSymbol = true,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  // Handle null, undefined, or invalid values
  if (amount === null || amount === undefined || amount === '') {
    return showSymbol ? '₦0.00' : '0.00';
  }

  // Convert to number if string
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Handle NaN
  if (isNaN(numericAmount)) {
    return showSymbol ? '₦0.00' : '0.00';
  }

  // Format the number with locale-specific formatting
  const formatted = numericAmount.toLocaleString('en-NG', {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return showSymbol ? `₦${formatted}` : formatted;
}

/**
 * Formats a number as Nigerian Naira currency without decimal places
 * @param amount - The amount to format
 * @returns Formatted currency string with ₦ symbol (no decimals)
 */
export function formatNairaWhole(
  amount: number | string | null | undefined
): string {
  return formatNaira(amount, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Formats a number as Nigerian Naira currency for compact display
 * @param amount - The amount to format
 * @returns Formatted currency string with ₦ symbol and K/M suffixes
 */
export function formatNairaCompact(
  amount: number | string | null | undefined
): string {
  // Handle null, undefined, or invalid values
  if (amount === null || amount === undefined || amount === '') {
    return '₦0';
  }

  // Convert to number if string
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Handle NaN
  if (isNaN(numericAmount)) {
    return '₦0';
  }

  // Format with compact notation
  if (numericAmount >= 1000000) {
    return `₦${(numericAmount / 1000000).toFixed(1)}M`;
  } else if (numericAmount >= 1000) {
    return `₦${(numericAmount / 1000).toFixed(1)}K`;
  } else {
    return `₦${numericAmount.toLocaleString('en-NG')}`;
  }
}

/**
 * Parses a currency string and returns the numeric value
 * @param currencyString - The currency string to parse (e.g., "₦1,234.56")
 * @returns The numeric value or 0 if parsing fails
 */
export function parseNaira(currencyString: string): number {
  if (!currencyString || typeof currencyString !== 'string') {
    return 0;
  }

  // Remove currency symbol and commas, then parse
  const cleanString = currencyString.replace(/[₦,]/g, '').trim();
  const parsed = parseFloat(cleanString);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Validates if a string is a valid currency amount
 * @param value - The value to validate
 * @returns True if valid currency format
 */
export function isValidCurrency(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  // Remove currency symbol and commas for validation
  const cleanValue = value.replace(/[₦,]/g, '').trim();
  
  // Check if it's a valid number
  const parsed = parseFloat(cleanValue);
  return !isNaN(parsed) && parsed >= 0;
}