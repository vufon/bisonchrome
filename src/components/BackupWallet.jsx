import { useEffect, useState } from "react";

export default function BackupWallet() {

  const [time, setTime] = useState()

  useEffect(() => {
    chrome.storage.local.get(['minutes'], function(result) {
      setTime(result.minutes)
    })
  }, [])

  return (
    <div className="card backup-card mt-3">
      <p className="flex-center fw-bold text-danger mb-0">Backup your wallet</p>
      <p className="flex-center info text-danger text-center my-2">Write down your 12-word seed and keep it in a safe place. Do not share your backup with anyone.</p>
    </div>
  )
}