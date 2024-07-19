import BalanceArea from "./BalanceArea";
import BackupWallet from "./BackupWallet";
import AddressQR from "./AddressQR";

export default function Home({ state, setPage }) {
  const openNewTab = () => {
    window.open(`index.html`);
  }
  return (
    <div className="container">
      <div>
        <div class="top-banner d-flex justify-content-between">
          <div></div>
          <img src="/images/logo.png" alt="cashtab" class="main-logo" />
          <img src="/images/popout.svg" alt="Open in tab" width="25" height="25" onClick={openNewTab} class="cursor-pointer" />
        </div>
        <BalanceArea />
        <BackupWallet />
        <AddressQR />
      </div>
      <div>
        {/* <a onClick={() => setPage('settings')}>Settings</a> */}
      </div>
    </div>
  )
}