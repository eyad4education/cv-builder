import { forwardRef, useState } from 'react';
import { ArrowUpDown, Check, Loader2, X } from 'lucide-react';

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const panelClassName =
  'bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors';
export const fieldClassName =
  'flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all';
export const textareaClassName =
  'w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y transition-all';

export const Button = forwardRef(function Button(
  { className, variant = 'primary', size = 'md', isLoading = false, type, children, ...props },
  ref
) {
  const variants = {
    primary: 'bg-green-600 text-white hover:bg-green-700 shadow-sm dark:bg-green-500 dark:hover:bg-green-600',
    secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700',
    outline: 'border border-slate-300 dark:border-slate-600 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm dark:bg-red-500 dark:hover:bg-red-600',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg',
  };

  return (
    <button
      ref={ref}
      type={type || 'button'}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

export const Input = forwardRef(function Input(
  { className, label, error, id, value, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        value={value ?? ''}
        className={cn(fieldClassName, error && 'border-red-500 focus:ring-red-500', className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

export function TagInput({ label, tags, onChange, placeholder }) {
  const [input, setInput] = useState('');

  function addTag() {
    const trimmed = input.trim();

    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInput('');
    }
  }

  function removeTag(tagToRemove) {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag();
    }
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-600 focus:outline-none"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Type and press Enter'}
          className="flex-1"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export function SaveStatus({ status }) {
  if (status === 'idle') {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm font-medium transition-all">
      {status === 'saving' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
          <span className="text-slate-500">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-green-600">Saved</span>
        </>
      )}
      {status === 'error' && <span className="text-red-600">Error saving</span>}
    </div>
  );
}

export function SectionToggle({ order, onChange }) {
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors w-full">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">
        Prioritize:
      </span>
      <button
        onClick={() => onChange('experience')}
        className={cn(
          'flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all',
            order === 'experience'
              ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
        )}
      >
        Experience
      </button>
      <ArrowUpDown className="h-4 w-4 text-slate-400 shrink-0" />
      <button
        onClick={() => onChange('education')}
        className={cn(
          'flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all',
            order === 'education'
              ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
        )}
      >
        Education
      </button>
    </div>
  );
}
