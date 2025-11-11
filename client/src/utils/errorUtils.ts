import { UseFormSetError } from 'react-hook-form';

/**
 * Parse server validation errors and set them on form fields
 * Handles Joi validation error format: "Validation Error: field1 must be ...; field2 must be ..."
 */
export function parseServerValidationErrors(error: any, setError: UseFormSetError<any>): void {
  // Parse Joi validation error message format
  // "Validation Error: field1 must be ...; field2 must be ..."
  if (error.message?.includes('Validation Error:')) {
    const errorsText = error.message.replace('Validation Error: ', '');
    const errorMessages = errorsText.split('; ');

    errorMessages.forEach((msg: string) => {
      // Extract field name from message like '"fieldName" is required'
      const fieldMatch = msg.match(/^"([^"]+)"/);
      if (fieldMatch) {
        const fieldName = fieldMatch[1];
        setError(fieldName, { type: 'server', message: msg });
      } else {
        // If no field name, try to extract from "fieldName must be..." format
        const simpleFieldMatch = msg.match(/^(\w+)\s+/);
        if (simpleFieldMatch) {
          const fieldName = simpleFieldMatch[1];
          setError(fieldName, { type: 'server', message: msg });
        }
      }
    });
    return;
  }

  // Handle other error formats
  if (error.response?.data?.errors) {
    // Array of field errors
    if (Array.isArray(error.response.data.errors)) {
      error.response.data.errors.forEach((err: any) => {
        if (err.field && err.message) {
          setError(err.field, { type: 'server', message: err.message });
        }
      });
    }
  }

  // Handle validation errors from response data
  if (error.response?.data?.error?.includes('Validation')) {
    const message = error.response.data.message || error.response.data.error;
    if (message?.includes(':')) {
      const parts = message.split(':');
      if (parts.length > 1) {
        const errorPart = parts[1].trim();
        const fieldErrors = errorPart.split(';');
        fieldErrors.forEach((fieldError: string) => {
          const match = fieldError.match(/^"?(\w+)"?\s+/);
          if (match) {
            const fieldName = match[1];
            setError(fieldName, { type: 'server', message: fieldError.trim() });
          }
        });
      }
    }
  }
}

/**
 * Extract error message from various error formats
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  return (
    error?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    'An error occurred'
  );
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: any): boolean {
  const message = getErrorMessage(error);
  return message.includes('Validation Error:') || message.includes('Validation');
}
