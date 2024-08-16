// Copyright (c) 2024 The Bitcoin developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import React from 'react';
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
import { CurrencySelect } from '../common/Inputs';
import Switch from '../common/Switch';
import { WalletContext } from '../../wallet/context';

const VersionContainer = styled.div`
    color: ${props => props.theme.contrast};
`;

const ConfigIconWrapper = styled.div`
    svg {
        height: 42px;
        width: 42px;
        fill: ${props => props.theme.eCashBlue};
    }
`;
const StyledConfigure = styled.div`
    margin: 12px 0;
`;

const HeadlineAndIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin: 12px 0;
`;
const Headline = styled.div`
    font-size: 20px;
    color: ${props => props.theme.contrast};
    font-weight: bold;
`;

const StyledSpacer = styled.div`
    height: 1px;
    width: 100%;
    background-color: ${props => props.theme.lightWhite};
    margin: 60px 0 50px;
`;

const SettingsLabel = styled.div`
    text-align: left;
    display: flex;
    gap: 9px;
    color: ${props => props.theme.contrast};
`;

const Switches = styled.div`
    flex-direction: column;
    display: flex;
    gap: 12px;
`;
const GeneralSettingsItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    color: ${props => props.theme.lightWhite};
`;

const Configure = () => {
    const ContextValue = React.useContext(WalletContext);
    const { updateDecredState, decredState } = ContextValue;
    const { settings, wallets } = decredState;

    const wallet = wallets.length > 0 ? wallets[0] : false;
    return (
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
                        checked={false}
                    />
                    <SettingsLabel>Send Confirmations</SettingsLabel>
                </GeneralSettingsItem>
                {isMobile(navigator) && (
                    <GeneralSettingsItem>
                        <Switch
                            name="Toggle QR Code Scanner Auto-open"
                            checked={false}
                        />
                        <SettingsLabel>Auto-open camera on send</SettingsLabel>
                    </GeneralSettingsItem>
                )}
            </Switches>
            <StyledSpacer />
            <SocialContainer>
                <SocialLink
                    href="https://x.com/decredproject"
                    target="_blank"
                    rel="noreferrer"
                >
                    <ThemedXIcon />
                </SocialLink>{' '}
                <SocialLink
                    href="https://www.facebook.com/decredproject"
                    target="_blank"
                    rel="noreferrer"
                >
                    <ThemedFacebookIcon />
                </SocialLink>
                <SocialLink
                    href="https://github.com/decred"
                    target="_blank"
                    rel="noreferrer"
                >
                    <GithubIcon />
                </SocialLink>
            </SocialContainer>

            {typeof process.env.REACT_APP_VERSION === 'string' && (
                <>
                    <StyledSpacer />
                    <VersionContainer>
                        v{process.env.REACT_APP_VERSION}
                    </VersionContainer>
                </>
            )}
        </StyledConfigure>
    );
};

export default Configure;
