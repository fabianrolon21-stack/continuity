import { ShieldCheck } from 'lucide-react';

/**
 * The private conversation that must happen before anything is shared.
 * Deliberately plain and slightly formal — this is the one place in the
 * app where clarity matters more than warmth.
 */
export default function ConsentConversation({ consent, onConfirm, onCancel }) {
  return (
    <div className="mt-4 rounded-xl border border-peach/30 bg-peach/5 p-4">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-4 h-4 text-peach" />
        <p className="text-sm font-medium text-peach">Before anything is shared</p>
      </div>

      <p className="text-xs text-foreground/85 whitespace-pre-line leading-relaxed">{consent.consent_explanation}</p>

      <div className="flex gap-2 mt-4">
        <button onClick={onConfirm} className="text-xs px-3 py-1.5 rounded-lg bg-peach text-background font-medium">
          Yes, share these
        </button>
        <button onClick={onCancel} className="text-xs px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground">
          No, cancel
        </button>
      </div>
    </div>
  );
}