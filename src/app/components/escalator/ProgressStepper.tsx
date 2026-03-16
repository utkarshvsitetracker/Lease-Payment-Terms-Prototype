import { Check } from 'lucide-react';

const STEPS = [
  { n: 1, label: 'Escalator' },
  { n: 2, label: 'Period' },
  { n: 3, label: 'Rules & Reason' },
  { n: 4, label: 'Review & Apply' },
];

interface ProgressStepperProps {
  currentStep: number;
}

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  return (
    <div className="flex items-center w-full px-2">
      {STEPS.map((step, idx) => {
        const done = currentStep > step.n;
        const active = currentStep === step.n;
        const last = idx === STEPS.length - 1;

        return (
          <div key={step.n} className="flex items-center" style={{ flex: last ? 'none' : 1 }}>
            {/* Circle + label */}
            <div className="flex flex-col items-center gap-1">
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: done
                    ? 'var(--primary)'
                    : active
                    ? 'var(--primary)'
                    : 'var(--muted)',
                  border: done || active ? 'none' : '2px solid var(--border)',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                {done ? (
                  <Check style={{ width: 14, height: 14, color: 'var(--primary-foreground)' }} />
                ) : (
                  <span
                    style={{
                      color: active ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                      fontSize: 'var(--text-label)',
                      fontWeight: 'var(--font-weight-medium)',
                      lineHeight: 1,
                    }}
                  >
                    {step.n}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: 'var(--text-label)',
                  color: active || done ? 'var(--primary)' : 'var(--muted-foreground)',
                  fontWeight: active ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {!last && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  marginBottom: 18,
                  marginLeft: 4,
                  marginRight: 4,
                  background: done ? 'var(--primary)' : 'var(--border)',
                  transition: 'background 0.2s',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
