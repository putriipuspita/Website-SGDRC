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
      {label && <label className="text-slate-950 text-[12.5px] lg:text-[12.2px] xl:text-[12.9px] 2xl:text-[13.7px] font-semibold ml-1">{label}</label>}

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
          value={value || ''}
          onChange={onChange}
          onClick={(e) => {
            if (type === 'date' || type === 'datetime-local') {
              try { e.target.showPicker(); } catch (err) {}
            }
          }}
          placeholder={placeholder}
          className={`w-full text-[12.5px] lg:text-[12.2px] xl:text-[12.9px] 2xl:text-[13.7px] tracking-tight placeholder:text-[11.5px] placeholder:text-slate-500 rounded-xl py-2.5 pr-4 border-2 outline-none font-medium transition-all duration-300 [&::-webkit-calendar-picker-indicator]:hidden ${Icon ? 'pl-10' : 'pl-4'} ${
            disabled || readOnly
              ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-white border-slate-200 text-slate-950'
          }`}
        />
      </div>
    </div>
  );
};
