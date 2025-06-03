import { useState, useCallback, useMemo } from "react";

export interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Record<string, string>;
  onSubmit: (values: T) => Promise<void> | void;
  resetOnSubmit?: boolean;
}

export interface FormField {
  value: any;
  error?: string;
  touched: boolean;
}

export interface UseFormReturn<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  setValue: (name: keyof T, value: any) => void;
  setError: (name: keyof T, error: string) => void;
  setTouched: (name: keyof T, touched?: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  reset: () => void;
  validateField: (name: keyof T) => void;
  validateForm: () => boolean;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
  resetOnSubmit = false,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouchedState] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // 値が変更されたらエラーをクリア
    if (errors[name as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as string];
        return newErrors;
      });
    }
  }, [errors]);

  const setError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name as string]: error }));
  }, []);

  const setTouched = useCallback((name: keyof T, touched = true) => {
    setTouchedState(prev => ({ ...prev, [name as string]: touched }));
  }, []);

  const validateField = useCallback((name: keyof T) => {
    if (!validate) return;
    
    const fieldErrors = validate(values);
    const fieldError = fieldErrors[name as string];
    
    if (fieldError) {
      setError(name, fieldError);
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as string];
        return newErrors;
      });
    }
  }, [values, validate, setError]);

  const validateForm = useCallback(() => {
    if (!validate) return true;
    
    const formErrors = validate(values);
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  }, [values, validate]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    let newValue: any = value;
    
    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === "number") {
      newValue = value === "" ? "" : Number(value);
    }
    
    setValue(name as keyof T, newValue);
  }, [setValue]);

  const handleBlur = useCallback((
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    setTouched(name as keyof T);
    validateField(name as keyof T);
  }, [setTouched, validateField]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // 全フィールドをtouchedに設定
    const touchedFields = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouchedState(touchedFields);
    
    // バリデーション実行
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(values);
      
      if (resetOnSubmit) {
        reset();
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, isSubmitting, validateForm, onSubmit, resetOnSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouchedState({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setError,
    setTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validateField,
    validateForm,
  };
}

// よく使われるバリデーション関数
export const validators = {
  required: (message = "必須項目です") => (value: any) => {
    if (value === null || value === undefined || value === "") {
      return message;
    }
    return undefined;
  },
  
  email: (message = "有効なメールアドレスを入力してください") => (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return message;
    }
    return undefined;
  },
  
  minLength: (min: number, message?: string) => (value: string) => {
    if (value && value.length < min) {
      return message || `${min}文字以上で入力してください`;
    }
    return undefined;
  },
  
  maxLength: (max: number, message?: string) => (value: string) => {
    if (value && value.length > max) {
      return message || `${max}文字以下で入力してください`;
    }
    return undefined;
  },
  
  pattern: (regex: RegExp, message = "入力形式が正しくありません") => (value: string) => {
    if (value && !regex.test(value)) {
      return message;
    }
    return undefined;
  },
  
  min: (min: number, message?: string) => (value: number) => {
    if (value !== null && value !== undefined && value < min) {
      return message || `${min}以上の数値を入力してください`;
    }
    return undefined;
  },
  
  max: (max: number, message?: string) => (value: number) => {
    if (value !== null && value !== undefined && value > max) {
      return message || `${max}以下の数値を入力してください`;
    }
    return undefined;
  },
};

// 複数のバリデーション関数を組み合わせるヘルパー
export function combineValidators<T>(...validators: Array<(value: T) => string | undefined>) {
  return (value: T) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return undefined;
  };
} 