import { CalendarPlus, HardDrive, Printer, RefreshCw, Share, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Button } from '../ui';
import { cx } from '../../lib/ui';
import ConfirmPopover from './ConfirmPopover';

const iconBtn = 'btn btn-secondary btn-icon w-11 min-h-11';

/** Trip actions. Hidden in print. */
export default function TripToolbar({ onAdjust, onRegenerate, onShare, onCalendar, onPrint, onDelete, busy }) {
  return (
    <div className="no-print">
      <div className="container-x flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-4">
        <p className="hidden md:inline-flex items-center gap-1.5 t-footnote t-tertiary">
          <HardDrive size={14} strokeWidth={2} aria-hidden />
          Saved on this device
        </p>
        <div role="toolbar" aria-label="Trip actions" className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="primary" size="sm" icon={SlidersHorizontal} onClick={onAdjust} className="min-h-11" aria-haspopup="dialog">
            Adjust
          </Button>
          <button type="button" onClick={onRegenerate} disabled={busy} className={cx('btn btn-secondary btn-sm min-h-11 px-3 sm:px-4')} aria-label="Regenerate with the same details">
            <RefreshCw size={15} strokeWidth={2} aria-hidden />
            <span className="hidden sm:inline">Regenerate</span>
          </button>
          <span className="flex-1 md:hidden" />
          <button type="button" onClick={onShare} className={iconBtn} aria-label="Share itinerary" title="Share">
            <Share size={18} strokeWidth={2} aria-hidden />
          </button>
          {onCalendar && (
            <button type="button" onClick={onCalendar} className={iconBtn} aria-label="Add to calendar" title="Add to calendar">
              <CalendarPlus size={18} strokeWidth={2} aria-hidden />
            </button>
          )}
          <button type="button" onClick={onPrint} className={iconBtn} aria-label="Print or save as PDF" title="Print or save as PDF">
            <Printer size={18} strokeWidth={2} aria-hidden />
          </button>
          <ConfirmPopover
            title="Delete this trip?"
            message="It will be removed from this device. This can’t be undone."
            confirmLabel="Delete"
            onConfirm={onDelete}
            renderTrigger={(props) => (
              <button type="button" {...props} className={iconBtn} aria-label="Delete trip" title="Delete trip" style={{ color: 'var(--red-text)' }}>
                <Trash2 size={18} strokeWidth={2} aria-hidden />
              </button>
            )}
          />
        </div>
      </div>
    </div>
  );
}
