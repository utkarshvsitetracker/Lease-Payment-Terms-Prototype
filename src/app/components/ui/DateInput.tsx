import { useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface DateInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoOpen?: boolean;
  autoPopulate?: boolean;
  disabled?: boolean;
  className?: string;
  wrapperClassName?: string;
  placeholder?: string;
  id?: string;
  name?: string;
}

function generateDefaultDate(): string {
  const today = new Date();
  const offset = 25 + Math.floor(Math.random() * 13);
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Controlled date input.
 * - Clicking the field OR the calendar icon opens the native date picker.
 * - autoPopulate: pre-fills with a date ~1 month from today on mount (empty fields only).
 * - autoOpen: calls showPicker() on mount (empty fields only, needs user-gesture context).
 */
export function DateInput({
  value,
  onChange,
  autoOpen = false,
  autoPopulate = false,
  disabled = false,
  className = '',
  wrapperClassName = '',
  ...rest
}: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const defaultDateRef = useRef<string>(generateDefaultDate());
  const initiallyEmpty = useRef<boolean>(!value || value === '');

  useEffect(() => {
    if (!initiallyEmpty.current) return;

    if (autoPopulate) {
      onChange({
        target: { value: defaultDateRef.current },
      } as React.ChangeEvent<HTMLInputElement>);
    }

    if (autoOpen) {
      // Small timeout so the value update above has flushed before opening.
      const t = setTimeout(() => {
        try { inputRef.current?.showPicker(); } catch { inputRef.current?.focus(); }
      }, 50);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Called directly by the input's own onClick — this IS a user gesture so
   * showPicker() is always allowed here by the browser.
   */
  const openPicker = () => {
    if (disabled) return;
    try {
      inputRef.current?.showPicker();
    } catch {
      inputRef.current?.focus();
    }
  };

  return (
    <div className={`relative ${wrapperClassName}`}>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={onChange}
        disabled={disabled}
        onClick={openPicker}
        style={{
          fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: 'var(--text-base)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          colorScheme: 'light dark',
        }}
        className={[
          'w-full border border-border bg-input-background rounded-[var(--radius)] p-3 pr-10',
          'text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className,
        ].join(' ')}
        {...rest}
      />

      {/*
        Calendar icon is a real button so clicking it also triggers openPicker.
        It sits on top of the input's padding-right area.
      */}
      <button
        type="button"
        tabIndex={-1}
        onClick={openPicker}
        disabled={disabled}
        style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          padding: 0,
          background: 'transparent',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--muted-foreground)',
          pointerEvents: disabled ? 'none' : 'auto',
        }}
        aria-label="Open date picker"
      >
        <Calendar style={{ width: 16, height: 16 }} />
      </button>
    </div>
  );
}
