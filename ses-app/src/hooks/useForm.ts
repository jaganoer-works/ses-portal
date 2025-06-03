import { useState, useCallback, useMemo, useRef } from "react";

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

  // Refを使用して最新の状態への参照を維持
  const errorsRef = useRef(errors);
  errorsRef.current = errors;

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // 現在のエラー状態をRefから取得（依存配列に含めない）
    if (errorsRef.current[name as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as string];
        return newErrors;
      });
    }
  }, []); // 依存配列を空にして安定化

  const setError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name as string]: error }));
  }, []); // 依存配列を空にして安定化

  const setTouched = useCallback((name: keyof T, touched = true) => {
    setTouchedState(prev => ({ ...prev, [name as string]: touched }));
  }, []);

  const validateField = useCallback((name: keyof T) => {
    if (!validate) return;
    
    setValues(currentValues => {
      const fieldErrors = validate(currentValues);
      const fieldError = fieldErrors[name as string];
      
      if (fieldError) {
        setErrors(prev => ({ ...prev, [name as string]: fieldError }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name as string];
          return newErrors;
        });
      }
      
      return currentValues; // 値は変更しない
    });
  }, [validate]);

  const validateForm = useCallback(() => {
    if (!validate) return true;
    
    let isFormValid = true;
    setValues(currentValues => {
      const formErrors = validate(currentValues);
      setErrors(formErrors);
      isFormValid = Object.keys(formErrors).length === 0;
      return currentValues; // 値は変更しない
    });
    
    return isFormValid;
  }, [validate]);

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
  
  pattern: (regex: RegExp, message?: string) => (value: string) => {
    if (value && !regex.test(value)) {
      return message || "形式が正しくありません";
    }
    return undefined;
  },
  
  number: (message = "数値を入力してください") => (value: any) => {
    if (value !== "" && value !== null && value !== undefined && isNaN(Number(value))) {
      return message;
    }
    return undefined;
  },
  
  min: (minValue: number, message?: string) => (value: any) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue < minValue) {
      return message || `${minValue}以上の値を入力してください`;
    }
    return undefined;
  },
  
  max: (maxValue: number, message?: string) => (value: any) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue > maxValue) {
      return message || `${maxValue}以下の値を入力してください`;
    }
    return undefined;
  },
};

// 複数のバリデーションを組み合わせる関数
export function combineValidators<T>(...validators: Array<(value: T) => string | undefined>) {
  return (value: T): string | undefined => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return undefined;
  };
} 