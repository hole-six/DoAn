import { AlertCircle, CheckCircle } from 'lucide-react'
import AppIcon from './AppIcon'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  icon?: React.ReactNode
  fullWidth?: boolean
}

export function Input({
  label,
  error,
  success,
  helperText,
  icon,
  fullWidth = false,
  className = '',
  style = {},
  ...props
}: InputProps) {
  const hasError = !!error
  const hasSuccess = !!success && !hasError

  return (
    <div
      className={`input-wrapper ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      {label && (
        <label
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: hasError ? '#dc2626' : '#1f2937',
            display: 'block',
          }}
        >
          {label}
          {props.required && <span style={{ color: '#dc2626', marginLeft: '4px' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', width: '100%' }}>
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: hasError ? '#dc2626' : '#9ca3af',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </div>
        )}

        <input
          {...props}
          className="input-field"
          style={{
            width: '100%',
            padding: icon ? '12px 40px 12px 40px' : '12px 16px',
            fontSize: '15px',
            fontWeight: 500,
            color: '#1f2937',
            background: '#ffffff',
            border: `2px solid ${hasError ? '#dc2626' : hasSuccess ? '#059669' : '#e5e7eb'}`,
            borderRadius: '10px',
            outline: 'none',
            transition: 'all 0.2s ease',
            ...style,
          }}
          onFocus={(e) => {
            if (!hasError && !hasSuccess) {
              e.currentTarget.style.borderColor = '#0e4d7d'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14, 77, 125, 0.1)'
            }
          }}
          onBlur={(e) => {
            if (!hasError && !hasSuccess) {
              e.currentTarget.style.borderColor = '#e5e7eb'
              e.currentTarget.style.boxShadow = 'none'
            }
          }}
        />

        {(hasError || hasSuccess) && (
          <div
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {hasError ? (
              <AppIcon icon={AlertCircle} size={18} style={{ color: '#dc2626' }} />
            ) : (
              <AppIcon icon={CheckCircle} size={18} style={{ color: '#059669' }} />
            )}
          </div>
        )}
      </div>

      {(error || success || helperText) && (
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            fontWeight: 600,
            color: hasError ? '#dc2626' : hasSuccess ? '#059669' : '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {error || success || helperText}
        </p>
      )}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  fullWidth?: boolean
}

export function Textarea({
  label,
  error,
  success,
  helperText,
  fullWidth = false,
  className = '',
  style = {},
  ...props
}: TextareaProps) {
  const hasError = !!error
  const hasSuccess = !!success && !hasError

  return (
    <div
      className={`textarea-wrapper ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      {label && (
        <label
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: hasError ? '#dc2626' : '#1f2937',
            display: 'block',
          }}
        >
          {label}
          {props.required && <span style={{ color: '#dc2626', marginLeft: '4px' }}>*</span>}
        </label>
      )}

      <textarea
        {...props}
        className="textarea-field"
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: '15px',
          fontWeight: 500,
          color: '#1f2937',
          background: '#ffffff',
          border: `2px solid ${hasError ? '#dc2626' : hasSuccess ? '#059669' : '#e5e7eb'}`,
          borderRadius: '10px',
          outline: 'none',
          transition: 'all 0.2s ease',
          minHeight: '100px',
          resize: 'vertical',
          fontFamily: 'inherit',
          ...style,
        }}
        onFocus={(e) => {
          if (!hasError && !hasSuccess) {
            e.currentTarget.style.borderColor = '#0e4d7d'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14, 77, 125, 0.1)'
          }
        }}
        onBlur={(e) => {
          if (!hasError && !hasSuccess) {
            e.currentTarget.style.borderColor = '#e5e7eb'
            e.currentTarget.style.boxShadow = 'none'
          }
        }}
      />

      {(error || success || helperText) && (
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            fontWeight: 600,
            color: hasError ? '#dc2626' : hasSuccess ? '#059669' : '#6b7280',
          }}
        >
          {error || success || helperText}
        </p>
      )}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  options: Array<{ value: string; label: string }>
}

export function Select({
  label,
  error,
  helperText,
  fullWidth = false,
  options,
  className = '',
  style = {},
  ...props
}: SelectProps) {
  const hasError = !!error

  return (
    <div
      className={`select-wrapper ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      {label && (
        <label
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: hasError ? '#dc2626' : '#1f2937',
            display: 'block',
          }}
        >
          {label}
          {props.required && <span style={{ color: '#dc2626', marginLeft: '4px' }}>*</span>}
        </label>
      )}

      <select
        {...props}
        className="select-field"
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: '15px',
          fontWeight: 500,
          color: '#1f2937',
          background: '#ffffff',
          border: `2px solid ${hasError ? '#dc2626' : '#e5e7eb'}`,
          borderRadius: '10px',
          outline: 'none',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          ...style,
        }}
        onFocus={(e) => {
          if (!hasError) {
            e.currentTarget.style.borderColor = '#0e4d7d'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14, 77, 125, 0.1)'
          }
        }}
        onBlur={(e) => {
          if (!hasError) {
            e.currentTarget.style.borderColor = '#e5e7eb'
            e.currentTarget.style.boxShadow = 'none'
          }
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {(error || helperText) && (
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            fontWeight: 600,
            color: hasError ? '#dc2626' : '#6b7280',
          }}
        >
          {error || helperText}
        </p>
      )}
    </div>
  )
}
