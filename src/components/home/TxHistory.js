// Copyright (c) 2024 The Bitcoin developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import React from 'react';
import Tx from './Tx';

const TxHistory = ({
    txs,
    wallet,
    fiatPrice,
    fiatCurrency,
    decredState,
    updateDecredState,
    userLocale = 'en-US',
}) => {
    return (
        <>
            {txs.map(tx => (
                <Tx
                    key={tx.txid}
                    tx={tx}
                    wallet={wallet}
                    fiatPrice={fiatPrice}
                    fiatCurrency={fiatCurrency}
                    decredState={decredState}
                    updateDecredState={updateDecredState}
                    userLocale={userLocale}
                />
            ))}
        </>
    );
};

export default TxHistory;
