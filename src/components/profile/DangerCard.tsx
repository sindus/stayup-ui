export function DangerCard() {
  return (
    <div
      className="rounded-[14px] p-6"
      style={{
        background: 'var(--rose-dim)',
        border: '1px solid color-mix(in srgb, var(--rose) 30%, transparent)',
      }}
    >
      <h2 className="text-[16px] font-semibold mb-1" style={{ color: 'var(--rose)' }}>
        Supprimer mon compte
      </h2>
      <p className="text-[13px] text-muted-foreground mb-4 max-w-md">
        Toutes les données seront supprimées définitivement. Cette action est irréversible.
      </p>
      <button
        disabled
        title="Bientôt disponible"
        className="text-[13px] font-semibold px-3.5 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'var(--rose)', color: 'var(--rose-on)' }}
      >
        Supprimer
      </button>
    </div>
  )
}
