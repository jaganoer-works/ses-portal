import React from "react";

export interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "number" | "date" | "textarea" | "select";
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  rows?: number;
  min?: number;
  max?: number;
  className?: string;
}

export function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  required = false,
  placeholder,
  error,
  helpText,
  disabled = false,
  options = [],
  rows = 4,
  min,
  max,
  className = "",
}: FormFieldProps) {
  const baseInputClasses = "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed";
  const normalClasses = "border-gray-300 focus:ring-accent focus:border-accent";
  const errorClasses = "border-red-300 focus:ring-red-500 focus:border-red-500";
  
  const inputClasses = `${baseInputClasses} ${error ? errorClasses : normalClasses}`;

  const renderInput = () => {
    if (type === "textarea") {
      return (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={inputClasses}
        />
      );
    }

    if (type === "select") {
      return (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          className={inputClasses}
        >
          <option value="">選択してください</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        className={inputClasses}
      />
    );
  };

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
}

// チェックボックス用のフィールド
export interface CheckboxFieldProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
}

export function CheckboxField({
  label,
  name,
  checked,
  onChange,
  disabled = false,
  error,
  helpText,
  className = "",
}: CheckboxFieldProps) {
  return (
    <div className={className}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="focus:ring-accent h-4 w-4 text-accent border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor={name} className="font-medium text-gray-700">
            {label}
          </label>
          {helpText && !error && (
            <p className="text-gray-500">{helpText}</p>
          )}
          {error && (
            <p className="text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ラジオボタン用のフィールド
export interface RadioFieldProps {
  label: string;
  name: string;
  selectedValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: { value: string; label: string; description?: string }[];
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function RadioField({
  label,
  name,
  selectedValue,
  onChange,
  options,
  disabled = false,
  error,
  className = "",
}: RadioFieldProps) {
  return (
    <div className={className}>
      <fieldset>
        <legend className="text-sm font-medium text-gray-700 mb-3">{label}</legend>
        <div className="space-y-3">
          {options.map((option) => (
            <div key={option.value} className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id={`${name}-${option.value}`}
                  name={name}
                  type="radio"
                  value={option.value}
                  checked={selectedValue === option.value}
                  onChange={onChange}
                  disabled={disabled}
                  className="focus:ring-accent h-4 w-4 text-accent border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor={`${name}-${option.value}`} className="font-medium text-gray-700">
                  {option.label}
                </label>
                {option.description && (
                  <p className="text-gray-500">{option.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </fieldset>
    </div>
  );
} 