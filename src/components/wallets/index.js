// Copyright (c) 2024 The Bitcoin developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import React from 'react';
import {
    TrashcanIcon,
    EditIcon,
    AddContactIcon,
} from '../common/CustomIcons';
import PrimaryButton, {
    SecondaryButton,
    IconButton,
    CopyIconButton,
} from '../common/Buttons';
import {
    WalletsList,
    WalletsPanel,
    Wallet,
    WalletRow,
    ActionsRow,
    ActiveWalletName,
    WalletName,
    ButtonPanel,
    SvgButtonPanel,
    WalletBalance,
    ActivateButton,
} from './styles';

const Wallets = () => {
    return (
        <>
            <WalletsList title="Wallets">
                <WalletsPanel>
                    <WalletRow key={`account1_0`}>
                        <ActiveWalletName className="notranslate">
                            {"Account1"}
                        </ActiveWalletName>
                        <h4>(active)</h4>
                        <SvgButtonPanel>
                            <CopyIconButton
                                name={`Copy address of Account1`}
                                data={"DsbnXmY5yud8MwenFQJEfabQfZDedakeuwY"}
                                showToast
                            />
                            <IconButton
                                name={`Rename Account1`}
                                icon={<EditIcon />}
                            />
                            <IconButton
                                name={`Add Account1 to contacts`}
                                icon={<AddContactIcon />}
                            />
                        </SvgButtonPanel>
                    </WalletRow>

                    <Wallet key={`account2_1`}>
                        <WalletRow>
                            <WalletName>
                                <h3 className="overflow notranslate">
                                    {"Account2"} 
                                </h3>
                            </WalletName>
                            <WalletBalance>
                                {"25.7 DCR"}
                            </WalletBalance>
                        </WalletRow>
                        <ActionsRow>
                            <ButtonPanel>
                                <SvgButtonPanel>
                                    <CopyIconButton
                                        name={`Copy address of Account2`}
                                        data={"DsbnXmY5yud8MwenFQJEfabQfZDedakeuwY"}
                                        showToast
                                    />
                                    <IconButton
                                        name={`Rename Account2`}
                                        icon={<EditIcon />}
                                    />
                                    <IconButton
                                        name={`Add Account2 to contacts`}
                                        icon={<AddContactIcon />}
                                    />
                                    <IconButton
                                        name={`Delete Account2`}
                                        icon={<TrashcanIcon />}
                                    />
                                </SvgButtonPanel>
                                <ActivateButton
                                    aria-label={`Activate Account2`}
                                >
                                    Activate
                                </ActivateButton>
                            </ButtonPanel>
                        </ActionsRow>
                    </Wallet>
                </WalletsPanel>
                <WalletRow>
                    <PrimaryButton>
                        New Wallet
                    </PrimaryButton>
                </WalletRow>
                <WalletRow>
                    <SecondaryButton>
                        Import Wallet
                    </SecondaryButton>
                </WalletRow>
            </WalletsList>
        </>
    );
};

export default Wallets;
