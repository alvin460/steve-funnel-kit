import { useState } from 'react';
import LeadCaptureForm from './LeadCaptureForm';
import { cn } from '@/lib/cn';
import { buttonVariants } from '@/components/ui/form/Button/button.variants';

interface Props {
  formTags?: string[];
  submitLabel?: string;
  termsHtml?: string;
}

export default function MobileFormSheet({
  formTags = ['funnel_blueprint'],
  submitLabel = 'Get Instant Access',
  termsHtml,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out"
        style={{ transform: open ? 'translateY(0)' : 'translateY(100%)' }}
      >
        <div className="bg-background rounded-t-2xl border-t border-border shadow-2xl">
          {/* Handle + Close */}
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <h3 className="text-lg font-bold text-foreground">Get Instant Access</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-foreground-muted hover:text-foreground p-1 -mr-1"
              aria-label="Close form"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <div className="px-6 pb-8 max-h-[75vh] overflow-y-auto">
            <LeadCaptureForm
              formTags={formTags}
              submitLabel={submitLabel}
              termsHtml={termsHtml}
            />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Button */}
      {!open && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-background via-background/95 to-transparent">
          <button
            onClick={() => setOpen(true)}
            className={cn(
              buttonVariants({ variant: 'primary', size: 'lg', fullWidth: true }),
              '!h-14 !text-base shadow-lg'
            )}
          >
            <span>{submitLabel}</span>
            <svg className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
