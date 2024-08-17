export default function BackupWallet({ setPage }) {
  return (
    <div className="card backup-card mt-3">
      <p className="flex-center fw-bold text-danger mb-0 text-underline cursor-pointer" onClick={() => setPage('backup')}>Backup your wallet</p>
      <p className="flex-center info text-danger text-center my-2">Write down your 33-word seed and keep it in a safe place. Do not share your backup with anyone.</p>
    </div>
  )
}