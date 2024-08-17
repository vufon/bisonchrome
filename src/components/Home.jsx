import BackupWallet from "./BackupWallet";
import AddressQR from "./AddressQR";
import { WalletContext } from "../wallet/context";
import React from "react";
import { cleanParsedTxHistory, getWalletState } from "../wallet";
import { getUserLocale } from "../utils/helpers";
import TxHistory from "./home/TxHistory";
import styled from 'styled-components';

export const TxHistoryCtn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: ${props => props.theme.contrast};
  margin-top: 24px;
`;

export default function Home({ setPage }) {
  const ContextValue = React.useContext(WalletContext);
  const {
    fiatPrice,
    decredState,
    updateDecredState,
  } = ContextValue;
  const { settings, wallets } = decredState;
  const wallet = wallets.length > 0 ? wallets[0] : false;
  const walletState = getWalletState(wallet);
  const { parsedTxHistory } = walletState;
  const txHistories = cleanParsedTxHistory(parsedTxHistory)
  const hasHistory = parsedTxHistory && parsedTxHistory.length > 0;
  const userLocale = getUserLocale(navigator);
  return (
    <>
      <TxHistoryCtn>
        <TxHistory
          txs={Array.isArray(txHistories) ? txHistories : []}
          fiatPrice={fiatPrice}
          wallet={wallet}
          fiatCurrency={
            settings && settings.fiatCurrency
              ? settings.fiatCurrency
              : 'usd'
          }
          decredState={decredState}
          updateDecredState={updateDecredState}
          userLocale={userLocale}
        />
        {!hasHistory && (
          <>
            <BackupWallet setPage={setPage} />
            <AddressQR />
          </>
        )
        }
      </TxHistoryCtn>
    </>
  )
}