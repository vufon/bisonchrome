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
import CoinKey from 'coinkey';
import CoinInfo from 'coininfo';
import { encode, decode } from '../../address/dcraddr'
import HDKey from 'hdkey';

export const generateMnemonic = () => {
    const mnemonic = bip39.generateMnemonic(
        128,
        randomBytes,
        bip39.wordlists['english'],
    );
    return mnemonic;
};

const getPathInfo = (masterHDNode, abbreviatedDerivationPath) => {
    const fullDerivationPath = `m/44'/${abbreviatedDerivationPath}'/0'/0/0`;
    console.log('check devivation path : ' + fullDerivationPath)
    const node = masterHDNode.derivePath(fullDerivationPath);
    const address = encode('P2PKH', node.identifier);
    const { hash } = decode(address, true);
    console.log('address: ' + address)
    return {
        hash,
        address,
        wif: node.toWIF(),
    };
};

const Wallets = () => {
    async function createWallet() {
        //const wallet = CoinKey.createRandom(CoinInfo("dcr").versions);
        const mnemonic = generateMnemonic()
        console.log('mnemonic: ' + mnemonic)
        // Convert the mnemonic to a seed
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        // Create an HD wallet key from the seed
        const hdKey = HDKey.fromMasterSeed(Buffer.from(seed, "hex"));
        // Define the BIP44 path for Bitcoin (m/44'/0'/0'/0/0)
        const path = "m/44'/42'/0'/0/0";
        // Derive a child key from the HD key using the defined path
        const child = hdKey.derive(path);
        const coinKey = new CoinKey(child.privateKey, CoinInfo("dcr").versions)
        console.log('address: ' + coinKey.publicAddress)
        console.log('privateKey: ' + coinKey.privateKey.toString("hex"))
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
