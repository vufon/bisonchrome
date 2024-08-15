import BackupWallet from "./BackupWallet";
import AddressQR from "./AddressQR";

export default function Home({ setPage }) {
  return (
    <>
      <BackupWallet setPage={setPage} />
      <AddressQR />
    </>
  )
}