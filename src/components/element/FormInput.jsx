import React from 'react';

// Komponen Formulir Input
export const FormInput = ({
  label,
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  readOnly = false,
  onFocus,
  name,
  autoComplete
}) => {
  return (
    // Container
    <div className="space-y-1">
      {/* Label */}
      {label && <label className="text-slate-700 text-[12px] font-semibold ml-1">{label}</label>}

      {/* Container Input */}
      <div className="relative group">
        {/* Icon */}
        {Icon && (
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Icon size={14} className="text-slate-400 group-focus-within:text-[#0B255D] transition-colors" />
          </div>
        )}

        {/* Input */}
        <input
          type={type}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          onFocus={onFocus}
          name={name}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-white border border-slate-300 text-slate-800 text-[12px] placeholder:text-[11px] rounded-xl py-2.5 pr-4 focus:outline-none focus:border-[#0B255D] focus:ring-2 focus:ring-blue-500/10 transition-all duration-300 ${Icon ? 'pl-10' : 'pl-4'
            } ${disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed opacity-60' : ''}`}
        />
      </div>
    </div>
  );
};
