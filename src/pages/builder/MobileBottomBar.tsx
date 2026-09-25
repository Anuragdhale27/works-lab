interface MobileBottomBarProps {
  canGoBack: boolean;
  nextLabel: string;
  onBack: () => void;
  onNext: () => void;
  onPreview: () => void;
}

export function MobileBottomBar({ canGoBack, nextLabel, onBack, onNext, onPreview }: MobileBottomBarProps) {
  return (
    <div className="mobile-bottom-bar">
      <button type="button" className="mobile-bottom-btn" onClick={onBack} disabled={!canGoBack}>
        Back
      </button>
      <button type="button" className="mobile-bottom-btn" onClick={onPreview}>
        Preview
      </button>
      <button type="button" className="mobile-bottom-btn mobile-bottom-btn-primary" onClick={onNext}>
        {nextLabel}
      </button>
    </div>
  );
}
