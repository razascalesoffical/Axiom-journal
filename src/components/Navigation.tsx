import React from 'react';
import { ModalKind, NAV_ACTIONS, NavAction } from '../data/content';
import { openExternalUrl } from '../lib/navigation';

interface NavigationProps {
  readonly activeId: string;
  readonly ariaLabel: string;
  readonly className?: string;
  readonly onSelectAction: (action: NavAction) => void;
  readonly onOpenModal: (modal: ModalKind) => void;
}

export function Navigation({
  activeId,
  ariaLabel,
  className = '',
  onSelectAction,
  onOpenModal
}: NavigationProps) {
  const handleAction = (action: NavAction) => {
    if (action.id === 'login') {
      window.location.href = '/app/';
      return;
    }

    if (action.kind === 'external') {
      openExternalUrl(action.href);
      return;
    }

    if (action.kind === 'modal') {
      onOpenModal(action.modal);
      return;
    }

    onSelectAction(action);
  };

  return (
    <nav className={className} aria-label={ariaLabel}>
      {NAV_ACTIONS.map(action => {
        const isActive = activeId === action.id;
        const variantClass = isActive
          ? 'bg-[#ea1e33] text-white font-bold'
          : 'bg-[#1c1c1c] text-[#cfcfcf] hover:text-[#f6eedb] hover:bg-[#252525]';

        return (
          <button
            key={action.id}
            type="button"
            onClick={() => handleAction(action)}
            className={`px-3 py-1.5 text-[11px] uppercase transition-colors rounded-none focus-visible:outline-1 focus-visible:outline-[#ea1e33] ${variantClass}`}
          >
            {action.label}
          </button>
        );
      })}
    </nav>
  );
}
