import { useId, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { destinations } from '../../data/destinations';
import { cx } from '../../lib/ui';

const MAX_SUGGESTIONS = 6;

function suggestionsFor(query) {
  const q = query.trim().toLowerCase();
  if (!q) return destinations.slice(0, MAX_SUGGESTIONS);
  // Rank: name prefix → region prefix → name contains → region contains.
  const rank = (d) => {
    const name = d.name.toLowerCase();
    const region = d.region.toLowerCase();
    if (name === q) return -1; // already typed in full — nothing to suggest
    if (name.startsWith(q)) return 0;
    if (region.startsWith(q)) return 1;
    if (name.includes(q)) return 2;
    if (region.includes(q)) return 3;
    return -1;
  };
  return destinations
    .map((d) => ({ d, r: rank(d) }))
    .filter((x) => x.r >= 0)
    .sort((a, b) => a.r - b.r)
    .slice(0, MAX_SUGGESTIONS)
    .map((x) => x.d);
}

/**
 * Destination text input with an accessible suggestions listbox
 * (WAI-ARIA combobox, list autocomplete). Free text is always allowed.
 */
export default function DestinationField({ id, value, onChange, error, autoFocus, size = 'md', placeholder = 'Search a city or region', ref }) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const items = open ? suggestionsFor(value) : [];
  const expanded = items.length > 0;
  const activeIndex = active < items.length ? active : -1;

  const select = (d) => {
    onChange(d.name);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) { setOpen(true); setActive(0); return; }
      setActive((i) => (items.length ? (i + 1) % items.length : -1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) { setOpen(true); setActive(Math.min(MAX_SUGGESTIONS, destinations.length) - 1); return; }
      setActive((i) => (items.length ? (i - 1 + items.length) % items.length : -1));
    } else if (e.key === 'Enter') {
      // Pick the highlighted suggestion; otherwise let Enter submit the form.
      if (expanded && activeIndex >= 0) { e.preventDefault(); select(items[activeIndex]); }
      else setOpen(false);
    } else if (e.key === 'Escape') {
      if (expanded) { e.preventDefault(); e.stopPropagation(); setOpen(false); setActive(-1); }
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  const large = size === 'lg';

  return (
    <div className="relative">
      <Search
        size={large ? 20 : 18}
        strokeWidth={2}
        aria-hidden
        className={cx('absolute top-1/2 -translate-y-1/2 pointer-events-none', large ? 'left-4' : 'left-3.5')}
        style={{ color: 'var(--text-3)' }}
      />
      <input
        ref={ref}
        id={id}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={expanded && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        aria-invalid={error ? true : undefined}
        aria-required="true"
        autoComplete="off"
        autoCapitalize="words"
        spellCheck={false}
        enterKeyHint="go"
        maxLength={80}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setActive(-1); }}
        onClick={() => setOpen(true)}
        onBlur={() => { setOpen(false); setActive(-1); }}
        onKeyDown={onKeyDown}
        className={cx('input', large ? 'pl-12 !min-h-[56px] !text-[19px] font-medium' : 'pl-11')}
      />
      <ul
        id={listId}
        role="listbox"
        aria-label="Suggested destinations"
        hidden={!expanded}
        className="absolute z-30 left-0 right-0 top-[calc(100%+6px)] p-1.5 rounded-[14px] material-thick max-h-[320px] overflow-y-auto"
        style={{ boxShadow: 'var(--shadow-lg)', border: '1px solid var(--separator)' }}
      >
        {!value.trim() && expanded && (
          <li role="presentation" className="px-3 pt-1.5 pb-1 t-caption t-tertiary">Popular</li>
        )}
        {items.map((d, i) => (
          <li
            key={d.slug}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={i === activeIndex}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => select(d)}
            className="flex items-center gap-3 min-h-[44px] px-3 rounded-[9px] cursor-pointer hover:bg-fill"
            style={{ background: i === activeIndex ? 'var(--fill)' : undefined }}
          >
            <span className="w-7 h-7 shrink-0 rounded-[8px] flex items-center justify-center" style={{ background: 'var(--accent-soft)', color: 'var(--accent-text)' }}>
              <MapPin size={15} strokeWidth={2} aria-hidden />
            </span>
            <span className="min-w-0 flex-1 truncate">
              <span className="t-callout font-medium" style={{ color: 'var(--text)' }}>{d.name}</span>
              {d.region !== d.name && <span className="t-footnote t-tertiary"> · {d.region}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
