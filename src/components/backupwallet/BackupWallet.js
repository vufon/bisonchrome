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

const BackupFlex = styled.div`
    margin: 12px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 48px;
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
    justify-content: flex-start;
    width: 100%;
    gap: 12px;
`;
const SwitchLabel = styled.div``;

const BackupWallet = () => {
    const [showSeed, setShowSeed] = useState(false);
    const userLocale = getUserLocale(navigator);
    return (
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
                        ⚠️ NEVER SHARE YOUR SEED PHRASE
                        {!userLocale.includes('en-') && (
                            <>
                                <br />
                                <br />
                                ⚠️ STORE YOUR SEED PHRASE IN ENGLISH
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
                {showSeed && (
                    <CopyToClipboard
                        data={"seed text sample"}
                        showToast
                        customMsg={'Copied seed phrase'}
                    >
                        <Seed mnemonic={"seed text sample"} />
                    </CopyToClipboard>
                )}
            </FlexRow>
        </BackupFlex>
    );
};

export default BackupWallet;
