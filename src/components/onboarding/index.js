// Distributed under the MIT software license, see the accompanying
// Copyright (c) 2024 The Bitcoin developers
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import React, { useState } from 'react';
import { WalletContext } from '../../wallet/context';
import PrimaryButton, { SecondaryButton } from '../common/Buttons';
import { getWordSeedTypeFromMnemonic, validateMnemonic } from '../../validation/index';
import appConfig from '../../config/app';
import { WelcomeCtn, WelcomeLink, WelcomeText } from './styles';
import Modal from '../common/Modal';
import { CurrencyDropdown, CurrencyOption, ModalInput } from '../common/Inputs';
import { createDecredWallet } from '../../wallet';
import { generateMnemonic } from '../wallets';
import { WalletButtonRow } from '../wallets/styles';
import { HomeBackupArea } from '../Home';
import CopyToClipboard from '../common/CopyToClipboard';
import Seed from '../common/Seed';

const OnBoarding = () => {
    const ContextValue = React.useContext(WalletContext);
    const { updateDecredState, decredState } = ContextValue;
    const { wallets } = decredState;

    const [importedMnemonic, setImportedMnemonic] = useState('');
    const [showImportWalletModal, setShowImportWalletModal] = useState(false);
    const [showSPVCreateWallet, setShowSPVCreateWallet] = useState(false);
    const [showSPVWordSeed, setShowSPVWordSeed] = useState(false);
    const [wordSeed, setWordSeed] = useState('');
    const [spvWalletPassword, setSpvWalletPassword] = useState('');
    // Initialize as true so that validation error only renders after user input
    const [isValidMnemonic, setIsValidMnemonic] = useState(true);
    const [createdWallet, setCreatedWallet] = useState(false);

    async function importWallet() {
        // Event("Category", "Action", "Label")
        // Track number of created wallets from onboarding
        //Event('Onboarding.js', 'Create Wallet', 'Imported');
        const wordsSize = getWordSeedTypeFromMnemonic(importedMnemonic)
        const importedWallet = await createDecredWallet(importedMnemonic, true, wordsSize);
        updateDecredState('wallets', [...wallets, importedWallet]);
        // Close the modal
        setShowImportWalletModal(false);
    }

    async function createSPVWallet() {
        chrome.runtime.sendMessage({
            id: "wasm",
            payload: "createWallet",
            params: { password: spvWalletPassword }
        }, function (res) {
            console.log('check response data on popup: ' + JSON.stringify(res.response))
            setShowSPVCreateWallet(false)
            setCreatedWallet(true)
        })
    }

    const handleInput = e => {
        const { value } = e.target;

        // Validate mnemonic on change
        // Import button should be disabled unless mnemonic is valid
        setIsValidMnemonic(validateMnemonic(value));

        setImportedMnemonic(value);
    };
    const handlePasswordInput = e => {
        const { value } = e.target;
        setSpvWalletPassword(value);
    };
    async function createNewWordSeedWallet() {
        //Test WASM code. TODO: Remove
        chrome.runtime.sendMessage({
            id: "wasm",
            payload: "exportSeed"
        }, function (res) {
            console.log('check response data : ' + res.response)
        })
        // const mnemonicWords = generateMnemonic(12)
        // //check word seed type
        // const newWallet = await createDecredWallet(mnemonicWords, false, 12)
        // updateDecredState('wallets', [...wallets, newWallet]);
    }
    const seedTypeMenuOptions = [];
    seedTypeMenuOptions.push({
        label: '12-words seed',
        value: 12,
    })
    seedTypeMenuOptions.push({
        label: '17-words seed',
        value: 17,
    })
    seedTypeMenuOptions.push({
        label: '24-words seed',
        value: 24,
    })
    seedTypeMenuOptions.push({
        label: '33-words seed',
        value: 33,
    })
    const seedTypeOptions = seedTypeMenuOptions.map(menuOption => {
        return (
            <CurrencyOption
                key={menuOption.value}
                value={menuOption.value}
                data-testid={menuOption.value}
            >
                {menuOption.label}
            </CurrencyOption>
        );
    });

    return (
        <>
            {showImportWalletModal && (
                <Modal
                    height={210}
                    title={`Import wallet`}
                    handleOk={importWallet}
                    handleCancel={() => setShowImportWalletModal(false)}
                    showCancelButton
                    disabled={!isValidMnemonic || importedMnemonic === ''}
                >
                    <ModalInput
                        type="email"
                        placeholder="mnemonic (seed phrase)"
                        name="mnemonic"
                        value={importedMnemonic}
                        error={
                            isValidMnemonic ? false : 'Invalid 12-word mnemonic'
                        }
                        handleInput={handleInput}
                    />
                </Modal>
            )}
            {showSPVCreateWallet && (
                <Modal
                    height={210}
                    title={`Type Wallet Password`}
                    handleOk={createSPVWallet}
                    handleCancel={() => setShowSPVCreateWallet(false)}
                    showCancelButton
                >
                    <ModalInput
                        type="password"
                        placeholder="password"
                        name="password"
                        value={spvWalletPassword}
                        handleInput={handlePasswordInput}
                    />
                </Modal>
            )}
            <HomeBackupArea className="mt-4">
                <WelcomeCtn>
                    <h3>Welcome to Bison Chrome!</h3>
                    <WelcomeText>
                        Bison Chrome is an{' '}
                        <WelcomeLink
                            href="https://github.com/vufon/bisonchrome"
                            target="_blank"
                            rel="noreferrer"
                        >
                            open source,
                        </WelcomeLink>{' '}
                        non-custodial web wallet for {appConfig.name}.
                    </WelcomeText>
                    <WalletButtonRow>
                        <PrimaryButton onClick={() => createNewWordSeedWallet()}>
                            New Wallet
                        </PrimaryButton>
                    </WalletButtonRow>
                    <WalletButtonRow>
                        <SecondaryButton onClick={() => setShowImportWalletModal(true)}>
                            Import Wallet
                        </SecondaryButton>
                    </WalletButtonRow>
                    <WalletButtonRow>
                        <SecondaryButton onClick={() => setShowSPVCreateWallet(true)}>
                            Test Create SPV Wallet
                        </SecondaryButton>
                    </WalletButtonRow>
                    {createdWallet ? (
                        <WalletButtonRow>
                            <SecondaryButton onClick={() => setShowSPVWordSeed(true)}>
                                Show SPV word seed
                            </SecondaryButton>
                        </WalletButtonRow>
                    ) : (<></>)}
                    {showSPVWordSeed ? (
                        <FlexRow>
                            <CopyToClipboard
                                data={wordSeed}
                                showToast
                                customMsg={'Copied seed phrase'}
                            >
                                <Seed mnemonic={wordSeed} />
                            </CopyToClipboard>
                        </FlexRow>
                    ) : (<></>)}
                </WelcomeCtn>
            </HomeBackupArea>
        </>
    );
};

export default OnBoarding;
