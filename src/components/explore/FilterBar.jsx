import { useId } from 'react';
import { Search, X } from 'lucide-react';
import { Chip } from '../ui';
import { cx } from '../../lib/ui';

/** Search field with a clear button (iOS search-bar style). */
export function SearchField({ value, onChange, placeholder, label, className }) {
  const id = useId();
  return (
    <div className={cx('relative', className)} role="search">
      <label htmlFor={id} className="sr-only">{label}</label>
      <Search size={18} strokeWidth={2} aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-3)' }} />
      <input
        id={id}
        type="search"
        inputMode="search"
        autoComplete="off"
        enterKeyHint="search"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Escape' && value) { e.preventDefault(); onChange(''); } }}
        placeholder={placeholder}
        className="input pl-11 pr-12 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full"
          style={{ color: 'var(--text-3)' }}
        >
          <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center" style={{ background: 'var(--fill-3)' }}>
            <X size={12} strokeWidth={3} aria-hidden style={{ color: 'var(--surface)' }} />
          </span>
        </button>
      )}
    </div>
  );
}

/**
 * Row of toggle chips. Scrolls horizontally edge-to-edge on phones and wraps
 * from `md` up. options: [{ id, label }]; selected: string[]; "All" clears.
 */
export function ChipFilter({ options, selected, onToggle, onClear, label, allLabel = 'All' }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="-mx-[22px] px-[22px] md:mx-0 md:px-0 overflow-x-auto scrollbar-none md:overflow-visible"
    >
      <div className="flex gap-2 w-max md:w-auto md:flex-wrap py-1">
        <Chip selected={selected.length === 0} onClick={onClear}>{allLabel}</Chip>
        {options.map((o) => (
          <Chip key={o.id} selected={selected.includes(o.id)} onClick={() => onToggle(o.id)}>
            {o.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}
