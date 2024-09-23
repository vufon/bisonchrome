// Copyright (c) 2024 The Bitcoin developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import React, { useState } from 'react';
import styled from 'styled-components';
import {
    DollarIcon,
    SettingsIcon,
    ThemedXIcon,
    ThemedFacebookIcon,
    SocialContainer,
    SocialLink,
    GithubIcon,
} from '../common/CustomIcons';
import appConfig from '../../config/app';
import { isMobile } from '../../utils/helpers';
import { CurrencySelect, ModalInput } from '../common/Inputs';
import Switch from '../common/Switch';
import { WalletContext } from '../../wallet/context';
import PrimaryButton from '../common/Buttons';
import { toast } from 'react-toastify';
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

const ToggleLabel = styled.div`
    font-size: 17px;
    color: ${props => props.theme.contrast};
`;

export const StyledSpacer = styled.div`
    height: 1px;
    width: 100%;
    background-color: ${props => props.theme.lightWhite};
    margin: 20px 0;
`;

const SettingsLabel = styled.div`
    text-align: left;
    display: flex;
    gap: 9px;
    font-size: 
    color: ${props => props.theme.contrast};
`;
const Switches = styled.div`
    flex-direction: column;
    display: flex;
    gap: 12px;
    margin-top: 15px;
`;
const IndexHeadline = styled.div`
    font-size: 20px;
    position: absolute;
    margin-left: 160px;
    color: ${props => props.theme.contrast};
    font-weight: bold;
`;
const FeerateInput = styled.div`
    display: flex;
    align-items: center;
    width: 70%;
`;
const HeadlineLabel = styled.div`
    margin-top: 15px;
    margin-bottom: 10px;
    display: flex;
`;

const FeeRateArea = styled.div`
    width: 100%;
    display: flex;
    margin-top: 15px;
`;
const GeneralSettingsItem = styled.div`
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
    const { settings, wallets } = decredState;
    const wallet = wallets.length > 0 ? wallets[0] : false;
    const [feeRate, setFeeRate] = useState(settings.feeRate + '');
    const [feeRateError, setFeeRateError] = useState(false);
    const [useCustomFeeRate, setUseCustomFeeRate] = useState(settings.customFeeRate);
    const handleSendModalToggle = e => {
        updateDecredState('settings', {
            ...settings,
            sendModal: e.target.checked,
        });
    };
    const handleToggleCustomFeeRate = e => {
        setUseCustomFeeRate(!useCustomFeeRate)
        updateDecredState('settings', {
            ...settings,
            customFeeRate: e.target.checked,
        });
    };
    const updateFeeRate = e => {
        updateDecredState('settings', {
            ...settings,
            feeRate: parseFloat(feeRate),
        });
        toast.success('Fee rate setting updated successfully');
    };

    const handleInput = e => {
        const { value } = e.target;
        setFeeRate(value);
        if (!isNumeric(value)) {
            setFeeRateError('Fee rate must be a number')
            return
        } else {
            setFeeRateError(false)
        }
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
                <Switches>
                    <GeneralSettingsItem>
                        <Switch
                            name="Custom Fee Rate"
                            checked={settings.customFeeRate}
                            handleToggle={handleToggleCustomFeeRate}
                        />
                        <ToggleLabel>Custom Fee Rate</ToggleLabel>
                    </GeneralSettingsItem>
                </Switches>
                {useCustomFeeRate ? (
                    <>
                        <FeeRateArea>
                            <FeerateInput>
                                <ModalInput
                                    placeholder="Fee Rate"
                                    name="feerate"
                                    value={feeRate}
                                    handleInput={handleInput}
                                    error={feeRateError}
                                />
                                <IndexHeadline>DCR</IndexHeadline>
                            </FeerateInput>
                        </FeeRateArea>
                        <UpdateButtonRow>
                            <UpdateButton>
                                <PrimaryButton
                                    onClick={() => updateFeeRate()}
                                    disabled={feeRateError}
                                >
                                    Update
                                </PrimaryButton>
                            </UpdateButton>
                        </UpdateButtonRow>
                    </>
                ) : (<></>)}
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
