export default function BackupWallet({ setPage }) {
  return (
    <div className="card backup-card mb-0">
      <p className="flex-center fw-bold text-danger mb-0 text-underline cursor-pointer fs-16" onClick={() => setPage('backup')}>Backup your wallet</p>
      <p className="flex-center info text-danger text-center my-2 fs-16">Write down your seed phrases and keep it in a safe place. Do not share with anyone.</p>
    </div>
  )
}