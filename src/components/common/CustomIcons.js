// Copyright (c) 2024 The Bitcoin developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import * as React from 'react';
import styled from 'styled-components';
import appConfig from '../../config/app';
import { ReactComponent as Home } from '../../static/icons/home.svg';
import { ReactComponent as Send } from '../../static/icons/send.svg';
import { ReactComponent as Tokens } from '../../static/icons/tokens.svg';
import { ReactComponent as Receive } from '../../static/icons/receive.svg';
import { ReactComponent as Wallet } from '../../static/icons/wallet.svg';
import { ReactComponent as Bank } from '../../static/icons/bank.svg';
import { ReactComponent as Contacts } from '../../static/icons/contacts.svg';
import { ReactComponent as Airdrop } from '../../static/icons/airdrop-icon.svg';
import { ReactComponent as Reward } from '../../static/icons/reward.svg';
import { ReactComponent as Swap } from '../../static/icons/swap.svg';
import { ReactComponent as Settings } from '../../static/icons/settings.svg';
import { ReactComponent as Menu } from '../../static/icons/menu-icon.svg';
import { ReactComponent as Close } from '../../static/icons/close-icon.svg';
import { ReactComponent as QRCode } from '../../static/icons/qrcode.svg';
import { ReactComponent as CopyPaste } from '../../static/icons/copypaste.svg';
import { ReactComponent as Trashcan } from '../../static/icons/trashcan.svg';
import { ReactComponent as Edit } from '../../static/icons/edit.svg';
import { ReactComponent as AddContact } from '../../static/icons/addcontact.svg';
import { ReactComponent as XLogo } from '../../static/icons/xlogo.svg';
import { ReactComponent as Dollar } from '../../static/icons/dollar.svg';
import { ReactComponent as Facebook } from '../../static/icons/Facebook_Logo.svg';
import { ReactComponent as Github } from '../../static/icons/github.svg';
import { ReactComponent as Mined } from '../../static/icons/pickaxe.svg';
import { ReactComponent as LinkSolid } from '../../static/icons/external-link-square-alt.svg';

const Rotate = styled.div`
    transform: rotate(-45deg);
`;

export const ContactsIcon = () => <Contacts title="Contact List" />;
export const WalletIcon = () => <Wallet title="wallet" />;
export const ReceiveIcon = () => <Receive title="tx-received" />;
export const HomeIcon = () => <Home />;
export const TokensIcon = () => <Tokens title="Tokens" />;
export const BankIcon = () => <Bank title="wallets" />;
export const AirdropIcon = () => <Airdrop title="tx-airdrop" />;
export const RewardIcon = () => <Reward title="Cashtab Rewards" />;
export const SwapIcon = () => <Swap title="swap" />;
export const SettingsIcon = () => <Settings title="settings" />;
export const CloseIcon = () => <Close title="close" />;
export const MenuIcon = () => <Menu title="menu" />;
export const QRCodeIcon = () => <QRCode />;
export const CopyPasteIcon = () => <CopyPaste title="copy-paste" />;
export const AddContactIcon = () => <AddContact title="add-contact" />;
export const DollarIcon = () => <Dollar title="dollar sign" />;
export const CashReceivedNotificationIcon = () => (
    <img height={'24px'} width={'24px'} src={appConfig.logo} />
);
const MineRotate = styled.div`
    transform: rotate(45deg);
`;

export const MinedIcon = () => (
    <MineRotate>
        <Mined title="tx-mined" />
    </MineRotate>
);

export const ThemedLinkSolid = styled(LinkSolid)`
    fill: ${props => props.theme.contrast};
    padding: 0.15rem 0rem 0.18rem 0rem;
    height: 1.3em;
    width: 1.3em;
`;

export const ThemedXIcon = styled(XLogo)`
    height: 42px;
    width: 100%;
`;
export const ThemedFacebookIcon = styled(Facebook)`
    height: 42px;
    width: 100%;
`;
export const SocialContainer = styled.div`
    margin: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 220px;
    height: 42px;
`;
export const SocialLink = styled.a`
    width: 100%;
    height: 100%;
    @media (hover: hover) {
        :hover {
            svg {
                fill: ${props => props.theme.eCashPurple};
                path:not(#F) {
                    fill: ${props => props.theme.eCashPurple};
                }
            }
        }
    }
`;
const GithubIconWrapper = styled.div`
    svg {
        height: 42px;
        width: 42px;
    }
    svg,
    g,
    path {
        fill: ${props => props.theme.contrast};
    }
    fill: ${props => props.theme.contrast};
`;
export const GithubIcon = () => (
    <GithubIconWrapper>
        <Github height="142px" width="142px" title="Github" />
    </GithubIconWrapper>
);
export const SendIcon = () => (
    <Rotate>
        <Send title="tx-sent" />
    </Rotate>
);
const TrashCanWrapper = styled.div`
    stroke: ${props => props.theme.eCashBlue};
    fill: ${props => props.theme.eCashBlue};
    cursor: pointer;
`;
export const TrashcanIcon = () => (
    <TrashCanWrapper>
        <Trashcan title="trashcan" />
    </TrashCanWrapper>
);
const EditWrapper = styled.div`
    stroke: ${props => props.theme.eCashBlue};
    fill: ${props => props.theme.eCashBlue};
    cursor: pointer;
`;
export const EditIcon = () => (
    <EditWrapper>
        <Edit title="edit" />
    </EditWrapper>
);
export const NavWrapper = styled.div`
    width: 100%;
    height: 100%;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 1.3rem;
    margin-bottom: 5px;
`;

export const NavIcon = styled.span`
     @media (hover: hover) {
        ${NavWrapper}:hover & {
            background-color: ${props =>
        props.clicked ? 'transparent' : props.theme.eCashPurple};
            ::before,
            ::after {
                background-color: ${props => props.theme.eCashPurple};
            }
        }
    }

    position: relative;
    background-color: ${props =>
        props.clicked ? 'transparent' : props.theme.buttons.primary.color};
    width: 2rem;
    height: 2px;
    display: inline-block;
    transition: transform 300ms, top 300ms, background-color 300ms;
    &::before,
    &::after {
        content: '';
        background-color: ${props => props.theme.buttons.primary.color};
        width: 2rem;
        height: 2px;
        display: inline-block;
        position: absolute;
        left: 0;
        transition: transform 300ms, top 300ms, background-color 300ms;
    }
    &::before {
        top: ${props => (props.clicked ? '0' : '-0.8rem')};
        transform: ${props => (props.clicked ? 'rotate(135deg)' : 'rotate(0)')};
    }
    &::after {
        top: ${props => (props.clicked ? '0' : '0.8rem')};
        transform: ${props =>
        props.clicked ? 'rotate(-135deg)' : 'rotate(0)'};
    }
`;

export const NavItem = styled.button`
    display: flex;
    justify-content: space-between;
    text-align: left;
    font-size: 24px;
    padding: 12px;
    align-items: center;
    width: 100%;
    white-space: nowrap;
    background-color: ${props => props.theme.walletBackground};
    border: 1px solid ${props => props.theme.walletBackground};
    color: ${props => props.theme.contrast};
    gap: 6px;
    cursor: pointer;
    &:hover {
        color: ${props => props.theme.eCashPurple};
        svg,
        g,
        path {
            fill: ${props => props.theme.eCashPurple};
        }
    }
    svg {
        fill: ${props => props.theme.contrast};
        max-width: 33px;
        height: auto;
        flex: 1;
    }
    g,
    path {
        fill: ${props => props.theme.contrast};
    }
    p {
        flex: 2;
        margin: 0;
    }
    ${({ active, ...props }) =>
        active &&
        `    
        color: ${props.theme.navActive};
        svg, g, path {
            fill: ${props.theme.navActive};
        }
  `}
`;

export const NavMenu = styled.div`
    position: fixed;
    margin-right: 125px;
    bottom: 80px;
    display: flex;
    width: 225px;
    flex-direction: column;
    border: ${props => (props.open ? '1px solid' : '0px solid')};
    border-color: ${props =>
        props.open ? props.theme.contrast : 'transparent'};
    justify-content: center;
    align-items: center;
    @media (max-width: 768px) {
        right: 0;
        margin-right: 0;
    }
    overflow: hidden;
    transition: ${props =>
        props.open
            ? 'max-height 250ms ease-in-out , border-color 250ms ease-in-out, border-width 250ms ease-in-out'
            : 'max-height 250ms cubic-bezier(0, 1, 0, 1), border-color 250ms ease-in-out, border-width 250ms ease-in-out'};
    max-height: ${props => (props.open ? '100vh' : '0')};
`;