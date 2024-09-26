// Copyright (c) 2024 The Bitcoin developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import React, { useState } from 'react';
import styled from 'styled-components';
import CopyToClipboard from '../common/CopyToClipboard';
import Seed from '../common/Seed';
import Switch from '../common/Switch';
import { Alert, Info } from '../common/Atoms';
import { getUserLocale } from '../../utils/helpers';
import { WalletContext } from '../../wallet/context';
import { HomeBackupArea } from '../Home';

const BackupFlex = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 20px;
    color: ${props => props.theme.contrast};
    justify-content: flex-start;
`;
const FlexRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
`;
const SwitchRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 12px;
`;
const SwitchLabel = styled.div`
    font-size: 17px;`;

const BackupWallet = () => {
    const [showSeed, setShowSeed] = useState(false);
    const userLocale = getUserLocale(navigator);
    const ContextValue = React.useContext(WalletContext);
    const { decredState } = ContextValue;
    const { wallets } = decredState;
    const wallet = wallets.length > 0 ? wallets[0] : false;

    return (
        <HomeBackupArea>
            <BackupFlex>
                <FlexRow>
                    <Info>
                        ℹ️ Your seed phrase is the only way to restore your wallet.
                        Write it down. Keep it safe.
                    </Info>
                </FlexRow>
                <FlexRow>
                    <Alert className="notranslate">
                        <b>
                            <p className='c-red'>⚠️ Never share your seed phrase</p>
                            {!userLocale.includes('en-') && (
                                <>
                                    <p className='c-red mb-2'>⚠️ Store your seed phrase in English</p>
                                </>
                            )}
                        </b>
                    </Alert>
                </FlexRow>
                <SwitchRow>
                    <Switch
                        name="send-confirmations-switch"
                        checked={showSeed}
                        handleToggle={() => setShowSeed(!showSeed)}
                    />
                    <SwitchLabel>Show seed phrase</SwitchLabel>
                </SwitchRow>
                <FlexRow>
                    {showSeed && wallet && (
                        <CopyToClipboard
                            data={wallet.mnemonic}
                            showToast
                            customMsg={'Copied seed phrase'}
                        >
                            <Seed mnemonic={wallet.mnemonic} />
                        </CopyToClipboard>
                    )}
                </FlexRow>
            </BackupFlex>
        </HomeBackupArea >
    );
};

export default BackupWallet;
