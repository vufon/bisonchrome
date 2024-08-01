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
import * as bip39 from 'bip39';
import * as randomBytes from 'randombytes';
import * as utxolib from '@trezor/utxo-lib';
import appConfig from '../../config/app';
import { encode, decode } from '../../address/dcraddr'
import { createDecredWallet } from '../../wallet/index'
import { WalletContext } from '../../wallet/context';
import { toast } from 'react-toastify';
import { toFormattedXec } from '../../utils/formatting';
import { getUserLocale } from '../../utils/helpers';

export const generateMnemonic = () => {
    const mnemonic = bip39.generateMnemonic(
        128,
        randomBytes,
        bip39.wordlists['english'],
    );
    return mnemonic;
};

const Wallets = () => {
    const ContextValue = React.useContext(WalletContext);
    const { updateDecredState, decredState } = ContextValue;
    const { wallets } = decredState;
    const userLocale = getUserLocale(navigator);
    async function createWallet() {
        //const wallet = CoinKey.createRandom(CoinInfo("dcr").versions);
        const mnemonic = generateMnemonic()
        const newWallet = await createDecredWallet(mnemonic)
        const walletAlreadyInWalletsSomehow = wallets.find(
            wallet =>
                wallet.name === newWallet.name ||
                wallet.mnemonic === newWallet.mnemonic,
        );
        if (typeof walletAlreadyInWalletsSomehow !== 'undefined') {
            toast.error(
                `By a vanishingly small chance, "${newAddedWallet.name}" already existed in saved wallets. Please try again.`,
            );
            // Do not add this wallet
            return;
        }
        updateDecredState('wallets', [...wallets, newWallet]);

        toast.success(`New wallet "${newWallet.name}" added to wallets`);
        //     // Initialize wallet with empty state
        //     const wallet = {
        //         state: {
        //             balanceSats: 0,
        //             slpUtxos: [],
        //             nonSlpUtxos: [],
        //             tokens: new Map(),
        //             parsedTxHistory: [],
        //         },
        //     };

        //     const mnemonic = generateMnemonic()
        //     // Set wallet mnemonic
        //     wallet.mnemonic = mnemonic;
        //     const rootSeedBuffer = await bip39.mnemonicToSeed(mnemonic, '');
        //     const masterHDNode = utxolib.bip32.fromSeed(
        //         rootSeedBuffer,
        //         utxolib.networks.decred,
        //     );
        //     console.log('wallet balance: ' + masterHDNode)
        //     const additionalPaths = []
        //     const pathsToDerive = [appConfig.derivationPath, ...additionalPaths];
        //     wallet.paths = new Map();
        //     for (const path of pathsToDerive) {
        //         const pathInfo = getPathInfo(masterHDNode, path);
        //         if (path === appConfig.derivationPath) {
        //             // Initialize wallet name with first 5 chars of Path1899 address
        //             wallet.name = pathInfo.address.slice(1, 8);
        //         }
        //         wallet.paths.set(path, pathInfo);
        //     }
        //    console.log('wallet balance: ' + wallet.state.balanceSats)
    }
    return (
        <>
            <WalletsList title="Wallets">
                <WalletsPanel>
                    {wallets.map((wallet, index) =>
                        index === 0 ? (
                            <WalletRow key={`${wallet.name}_${index}`}>
                                <ActiveWalletName className="notranslate">
                                    {wallet.name}
                                </ActiveWalletName>
                                <h4>(active)</h4>
                                <SvgButtonPanel>
                                    <CopyIconButton
                                        name={`Copy address of ${wallet.name}`}
                                        data={wallet.paths[42].address}
                                        showToast
                                    />
                                    <IconButton
                                        name={`Rename ${wallet.name}`}
                                        icon={<EditIcon />}
                                    />
                                    <IconButton
                                        name={`Add ${wallet.name} to contacts`}
                                        icon={<AddContactIcon />}
                                    />
                                </SvgButtonPanel>
                            </WalletRow>
                        ) : (
                            <Wallet key={`${wallet.name}_${index}`}>
                                <WalletRow>
                                    <WalletName>
                                        <h3 className="overflow notranslate">
                                            {wallet.name}
                                        </h3>
                                    </WalletName>
                                    <WalletBalance>
                                        {wallet?.state?.balanceSats !== 0
                                            ? `${toFormattedXec(
                                                wallet.state.balanceSats,
                                                userLocale,
                                            )} DCR`
                                            : '-'}
                                    </WalletBalance>
                                </WalletRow>
                                <ActionsRow>
                                    <ButtonPanel>
                                        <SvgButtonPanel>
                                            <CopyIconButton
                                                name={`Copy address of ${wallet.name}`}
                                                data={wallet.paths[42].address}
                                                showToast
                                            />
                                            <IconButton
                                                name={`Rename ${wallet.name}`}
                                                icon={<EditIcon />}
                                            />
                                            <IconButton
                                                name={`Add Account2 to contacts`}
                                                icon={<AddContactIcon />}
                                            />
                                            <IconButton
                                                name={`Delete ${wallet.name}`}
                                                icon={<TrashcanIcon />}
                                            />
                                        </SvgButtonPanel>
                                        <ActivateButton
                                            aria-label={`Activate ${wallet.name}`}
                                        >
                                            Activate
                                        </ActivateButton>
                                    </ButtonPanel>
                                </ActionsRow>
                            </Wallet>
                        ),
                    )}
                </WalletsPanel>
                <WalletRow>
                    <PrimaryButton onClick={() => createWallet()}>
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
