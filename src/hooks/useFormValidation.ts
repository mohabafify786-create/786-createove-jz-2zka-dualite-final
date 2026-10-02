import { useState, useCallback, useMemo } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean;
  message: string;
}

export interface FieldConfig {
  [key: string]: ValidationRule[];
}

export interface FormErrors {
  [key: string]: string | null;
}

export interface UseFormValidationOptions {
  fields: FieldConfig;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormValidationReturn {
  errors: FormErrors;
  touched: Record<string, boolean>;
  isValid: boolean;
  validateField: (name: string, value: unknown) => string | null;
  validateAll: (values: Record<string, unknown>) => boolean;
  setFieldTouched: (name: string) => void;
  setFieldError: (name: string, error: string | null) => void;
  clearErrors: () => void;
  reset: () => void;
}

/**
 * Custom hook for form validation
 */
export function useFormValidation({
  fields,
  validateOnChange = true,
}: UseFormValidationOptions): UseFormValidationReturn {
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback(
    (name: string, value: unknown): string | null => {
      const rules = fields[name];
      if (!rules) return null;

      for (const rule of rules) {
        // Required check
        if (rule.required) {
          if (value === undefined || value === null || value === '' || 
              (Array.isArray(value) && value.length === 0)) {
            return rule.message;
          }
        }

        // Skip other validations if value is empty and not required
        if (value === undefined || value === null || value === '') {
          continue;
        }

        // String validations
        if (typeof value === 'string') {
          if (rule.minLength !== undefined && value.length < rule.minLength) {
            return rule.message;
          }
          if (rule.maxLength !== undefined && value.length > rule.maxLength) {
            return rule.message;
          }
          if (rule.pattern && !rule.pattern.test(value)) {
            return rule.message;
          }
        }

        // Number validations
        if (typeof value === 'number') {
          if (rule.min !== undefined && value < rule.min) {
            return rule.message;
          }
          if (rule.max !== undefined && value > rule.max) {
            return rule.message;
          }
        }

        // Custom validation
        if (rule.custom && !rule.custom(value)) {
          return rule.message;
        }
      }

      return null;
    },
    [fields]
  );

  const validateAll = useCallback(
    (values: Record<string, unknown>): boolean => {
      const newErrors: FormErrors = {};
      let isFormValid = true;

      Object.keys(fields).forEach((name) => {
        const error = validateField(name, values[name]);
        if (error) {
          newErrors[name] = error;
          isFormValid = false;
        }
      });

      setErrors(newErrors);
      return isFormValid;
    },
    [fields, validateField]
  );

  const setFieldTouched = useCallback((name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const setFieldError = useCallback((name: string, error: string | null) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const reset = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const isValid = useMemo(() => {
    return Object.values(errors).every((error) => error === null || error === undefined);
  }, [errors]);

  return {
    errors,
    touched,
    isValid,
    validateField: validateOnChange 
      ? (name: string, value: unknown) => {
          const error = validateField(name, value);
          setErrors((prev) => ({ ...prev, [name]: error }));
          return error;
        }
      : validateField,
    validateAll,
    setFieldTouched,
    setFieldError,
    clearErrors,
    reset,
  };
}

/**
 * Common validation rules
 */
export const commonValidations = {
  required: (message = 'This field is required'): ValidationRule => ({
    required: true,
    message,
  }),
  email: (message = 'Please enter a valid email'): ValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message,
  }),
  minLength: (length: number, message?: string): ValidationRule => ({
    minLength: length,
    message: message || `Must be at least ${length} characters`,
  }),
  maxLength: (length: number, message?: string): ValidationRule => ({
    maxLength: length,
    message: message || `Must be no more than ${length} characters`,
  }),
  age: (min = 18, max = 100): ValidationRule[] => [
    {
      required: true,
      message: 'Age is required',
    },
    {
      min,
      message: `Must be at least ${min} years old`,
    },
    {
      max,
      message: `Must be under ${max} years old`,
    },
  ],
  password: (): ValidationRule[] => [
    {
      required: true,
      message: 'Password is required',
    },
    {
      minLength: 8,
      message: 'Password must be at least 8 characters',
    },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: 'Password must contain uppercase, lowercase, and number',
    },
  ],
  name: (): ValidationRule[] => [
    {
      required: true,
      message: 'Name is required',
    },
    {
      minLength: 2,
      message: 'Name must be at least 2 characters',
    },
    {
      maxLength: 50,
      message: 'Name must be less than 50 characters',
    },
  ],
};

export default useFormValidation;
