// Copyright (c) 2024 The Bitcoin developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import React from 'react';
import styled from 'styled-components';
import {
    DollarIcon,
    SettingsIcon,
} from '../common/CustomIcons';
import { CurrencySelect } from '../common/Inputs';
import Switch from '../common/Switch';
import { WalletContext } from '../../wallet/context';
import { HomeBackupArea } from '../Home';

const VersionContainer = styled.div`
    color: ${props => props.theme.contrast};
`;

const ConfigIconWrapper = styled.div`
    svg {
        height: 30px;
        width: 30px;
        fill: ${props => props.theme.eCashBlue};
    }
`;
const StyledConfigure = styled.div`
    margin: 0 0 12px 0;
    width: 70%;
    margin-left: 25px;
`;

const HeadlineAndIcon = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    gap: 6px;
`;
const Headline = styled.div`
    font-size: 18px;
    color: ${props => props.theme.contrast};
    font-weight: bold;
`;

export const ToggleLabel = styled.div`
    font-size: 17px;
    color: ${props => props.theme.contrast};
`;

export const StyledSpacer = styled.div`
    height: 1px;
    width: 100%;
    background-color: ${props => props.theme.lightWhite};
    margin: 20px 0;
`;
export const Switches = styled.div`
    flex-direction: column;
    display: flex;
    gap: 12px;
    margin-top: 15px;
`;
export const GeneralSettingsItem = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    color: ${props => props.theme.lightWhite};
`;

export const UpdateButtonRow = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    margin-top: 10px;
`;

export const UpdateButton = styled.div`
    display: flex;
    width: 50%;
`;

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

const Configure = () => {
    const ContextValue = React.useContext(WalletContext);
    const { updateDecredState, decredState } = ContextValue;
    const { settings } = decredState;
    const handleSendModalToggle = e => {
        updateDecredState('settings', {
            ...settings,
            sendModal: e.target.checked,
        });
    };
    return (
        <HomeBackupArea>
            <StyledConfigure title="Settings">
                <HeadlineAndIcon>
                    <ConfigIconWrapper>
                        <DollarIcon />
                    </ConfigIconWrapper>{' '}
                    <Headline>Fiat Currency</Headline>
                </HeadlineAndIcon>
                <CurrencySelect
                    name="configure-fiat-select"
                    value={decredState.settings.fiatCurrency}
                    handleSelect={e => {
                        updateDecredState('settings', {
                            ...settings,
                            fiatCurrency: e.target.value,
                        });
                    }}
                />
                <StyledSpacer />
                <HeadlineAndIcon>
                    <ConfigIconWrapper>
                        <SettingsIcon />
                    </ConfigIconWrapper>{' '}
                    <Headline>General Settings</Headline>
                </HeadlineAndIcon>
                <Switches>
                    <GeneralSettingsItem>
                        <Switch
                            name="Toggle Send Confirmations"
                            checked={settings.sendModal}
                            handleToggle={handleSendModalToggle}
                        />
                        <ToggleLabel>Send Confirmations</ToggleLabel>
                    </GeneralSettingsItem>
                </Switches>
                {typeof process.env.REACT_APP_VERSION === 'string' && (
                    <>
                        <StyledSpacer />
                        <VersionContainer>
                            v{process.env.REACT_APP_VERSION}
                        </VersionContainer>
                    </>
                )}
            </StyledConfigure>
        </HomeBackupArea>
    );
};

export default Configure;
