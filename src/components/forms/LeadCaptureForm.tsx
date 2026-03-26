import { useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import type { E164Number } from 'libphonenumber-js';
import 'react-phone-number-input/style.css';
import { cn } from '@/lib/cn';
import { inputVariants } from '@/components/ui/form/Input/input.variants';
import { buttonVariants } from '@/components/ui/form/Button/button.variants';
import siteConfig from '@/config/site.config';

/** Custom input that prevents cursor from landing before the country calling code */
const PhoneField = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function PhoneField(props, ref) {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current!);

    const clampCursor = useCallback(() => {
      const el = inputRef.current;
      if (!el) return;
      const match = el.value.match(/^\+\d+\s*/);
      if (!match) return;
      const min = match[0].length;
      requestAnimationFrame(() => {
        if (el.selectionStart !== null && el.selectionStart < min) {
          el.setSelectionRange(min, min);
        }
      });
    }, []);

    return (
      <input
        {...props}
        ref={inputRef}
        onFocus={(e) => {
          props.onFocus?.(e);
          clampCursor();
        }}
        onClick={(e) => {
          props.onClick?.(e);
          clampCursor();
        }}
      />
    );
  }
);

interface Props {
  formTags?: string[];
  submitLabel?: string;
  successRedirect?: string;
  successLinkUrl?: string;
  successLinkLabel?: string;
  termsHtml?: string;
  /** Override default country from site.config.ts (ISO 3166-1 alpha-2, e.g. 'US') */
  defaultCountry?: string;
}

interface FormData {
  name: string;
  email: string;
}

export default function LeadCaptureForm({
  formTags = ['website_lead'],
  submitLabel = 'Submit',
  successRedirect,
  successLinkUrl,
  successLinkLabel = 'Access Your Resource',
  termsHtml,
  defaultCountry,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [phone, setPhone] = useState<E164Number | undefined>();
  const [phoneError, setPhoneError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    // Validate phone
    if (!phone) {
      setPhoneError('Phone number is required');
      return;
    }
    if (!isValidPhoneNumber(phone)) {
      setPhoneError('Please enter a valid phone number');
      return;
    }
    setPhoneError('');
    setLoading(true);

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone, // Already E.164 format from the library
          tags: formTags,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.error || `Server error (${res.status})`;
        console.error('Form submission failed:', errorMessage);
        toast.error('Failed to submit the form. Please try again later.');
        setLoading(false);
        return;
      }

      const result = await res.json();

      if (result.success) {
        setLoading(false);
        setSuccess(true);
        toast.success(successLinkUrl ? "You're in!" : "You're in! Check your inbox.");

        // If successLinkUrl is set, show inline success with resource link (no redirect)
        // If successRedirect is set (and no successLinkUrl), redirect to next step
        if (!successLinkUrl && successRedirect) {
          const baseUrl = window.location.origin;
          const redirectPath = successRedirect.startsWith('http')
            ? successRedirect
            : `${baseUrl}${successRedirect}`;
          const redirectUrl = new URL(redirectPath);
          redirectUrl.searchParams.set('email', data.email);
          setTimeout(() => {
            window.location.href = redirectUrl.toString();
          }, 750);
        }
      } else {
        setLoading(false);
        toast.error('Failed to submit the form. Please try again later.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred while submitting the form. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = cn(inputVariants({ size: 'md' }), 'px-4');
  const submitClasses = cn(
    buttonVariants({ variant: 'primary', size: 'lg', fullWidth: true }),
    '!mt-6'
  );
  const labelClasses = 'text-sm font-medium text-foreground';
  const errorClasses = 'text-sm text-[var(--error)]';

  // Show success state with resource link
  if (success && successLinkUrl) {
    return (
      <div className="mt-6 text-center py-8">
        <div className="h-14 w-14 rounded-full bg-[var(--brand-500)]/20 flex items-center justify-center mx-auto mb-5">
          <svg className="h-7 w-7 text-[var(--brand-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[var(--foreground)]">You're in!</h3>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">Your resource is ready. Click below to access it.</p>
        <a
          href={successLinkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), '!mt-6 inline-flex')}
        >
          {successLinkLabel} →
        </a>
      </div>
    );
  }

  return (
    <>
      <Toaster toastOptions={{ duration: 5000 }} position="top-center" reverseOrder={false} />
      <form id="hero-form" className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className={`block mb-2 ${labelClasses}`}>
            Your Name <span className="text-[var(--error)]">*</span>
          </label>
          <input
            type="text"
            placeholder="Full name"
            className={inputClasses}
            {...register('name', { required: true })}
          />
          {errors.name?.type === 'required' && (
            <div className={`mt-1 ${errorClasses}`}>Name can't be empty</div>
          )}
        </div>

        <div>
          <label className={`block mb-2 ${labelClasses}`}>
            Email <span className="text-[var(--error)]">*</span>
          </label>
          <input
            type="email"
            placeholder="Your email"
            className={inputClasses}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: 'Invalid email address',
              },
            })}
          />
          {errors.email && (
            <div className={`mt-1 ${errorClasses}`}>{errors.email.message}</div>
          )}
        </div>

        <div>
          <label className={`block mb-2 ${labelClasses}`}>
            Mobile Number <span className="text-[var(--error)]">*</span>
          </label>
          <PhoneInput
            international
            countryCallingCodeEditable={false}
            defaultCountry={(defaultCountry || siteConfig.phoneCountryCode || 'AU') as any}
            value={phone}
            onChange={setPhone}
            inputComponent={PhoneField}
            className="phone-input-kit"
          />
          {phoneError && (
            <div className={`mt-1 ${errorClasses}`}>{phoneError}</div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={submitClasses}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Loading...</span>
            </>
          ) : success ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span>Submitted</span>
            </>
          ) : (
            <span>{submitLabel}</span>
          )}
        </button>
      </form>

      {termsHtml && (
        <div
          className="mt-4 text-center text-xs text-foreground-muted [&_a]:text-foreground-muted [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-foreground"
          dangerouslySetInnerHTML={{ __html: termsHtml }}
        />
      )}

      <style>{`
        /* Single input group: flag + number inside one bordered container */
        .phone-input-kit {
          display: flex;
          align-items: center;
          width: 100%;
          height: 2.5rem;
          border-radius: var(--radius-lg, 0.5rem);
          border: 1px solid var(--border);
          background: var(--background);
          transition: border-color 0.15s, box-shadow 0.15s;
          --PhoneInputCountryFlag-height: 1.1em;
          --PhoneInputCountryFlag-borderColor: var(--border);
          --PhoneInputCountrySelectArrow-color: var(--foreground-muted);
          --PhoneInputCountrySelectArrow-opacity: 0.7;
        }
        .phone-input-kit:focus-within {
          outline: none;
          box-shadow: 0 0 0 2px var(--ring);
        }
        .phone-input-kit .PhoneInputCountry {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
          margin-right: 0;
          border-right: 1px solid var(--border);
          height: 100%;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .phone-input-kit .PhoneInputInput {
          flex: 1;
          border: none;
          background: transparent;
          height: 100%;
          padding-left: 0.75rem;
          padding-right: 0.75rem;
          font-size: 1rem;
          color: var(--foreground);
          outline: none;
          min-width: 0;
        }
        @media (min-width: 640px) {
          .phone-input-kit .PhoneInputInput {
            font-size: 0.875rem;
          }
        }
        .phone-input-kit .PhoneInputInput::placeholder {
          color: var(--muted-foreground);
        }
        .phone-input-kit .PhoneInputCountrySelect:focus + .PhoneInputCountryIcon + .PhoneInputCountrySelectArrow {
          color: var(--foreground);
        }
      `}</style>
    </>
  );
}
