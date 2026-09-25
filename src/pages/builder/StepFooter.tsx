interface StepFooterProps {
  canGoBack: boolean;
  nextLabel: string;
  onBack: () => void;
  onNext: () => void;
}

export function StepFooter({ canGoBack, nextLabel, onBack, onNext }: StepFooterProps) {
  return (
    <div className="step-footer">
      {canGoBack ? (
        <button type="button" className="btn btn-outline step-footer-back" onClick={onBack}>
          Back
        </button>
      ) : (
        <span />
      )}
      <button type="button" className="btn btn-primary step-footer-next" onClick={onNext}>
        {nextLabel}
      </button>
    </div>
  );
}
