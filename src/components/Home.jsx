import BackupWallet from "./BackupWallet";
import AddressQR from "./AddressQR";
import { WalletContext } from "../wallet/context";
import React from "react";

export default function Home({ setPage }) {
  const ContextValue = React.useContext(WalletContext);
  const {
    fiatPrice,
    apiError,
    decredState,
    updateDecredState,
  } = ContextValue;
  const { settings, wallets } = decredState;
  const wallet = wallets.length > 0 ? wallets[0] : false;
  return (
    <>
      <BackupWallet setPage={setPage} />
      <AddressQR />
    </>
  )
}