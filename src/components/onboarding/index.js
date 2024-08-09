// Copyright (c) 2024 The Bitcoin developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import React, { useState } from 'react';
import { WalletContext } from '../../wallet/context';
import PrimaryButton, { SecondaryButton } from '../common/Buttons';
import { validateMnemonic } from '../../validation/index';
import appConfig from '../../config/app';
import { WelcomeCtn, WelcomeLink, WelcomeText } from './styles';
import Modal from '../common/Modal';
import { ModalInput } from '../common/Inputs';
import { createDecredWallet } from '../../wallet';
import { generateMnemonic } from '../wallets';
import { DerivationPath } from '../../utils/const';

const OnBoarding = () => {
    const ContextValue = React.useContext(WalletContext);
    const { updateDecredState, decredState } = ContextValue;
    const { wallets } = decredState;

    const [importedMnemonic, setImportedMnemonic] = useState('');
    const [showImportWalletModal, setShowImportWalletModal] = useState(false);
    // Initialize as true so that validation error only renders after user input
    const [isValidMnemonic, setIsValidMnemonic] = useState(true);

    async function importWallet() {
        // Event("Category", "Action", "Label")
        // Track number of created wallets from onboarding
        //Event('Onboarding.js', 'Create Wallet', 'Imported');
        const importedWallet = await createDecredWallet(importedMnemonic);
        updateDecredState('wallets', [...wallets, importedWallet]);
        // Close the modal
        setShowImportWalletModal(false);
    }

    async function createNewWallet() {
        // Event("Category", "Action", "Label")
        // Track number of created wallets from onboarding
        //Event('Onboarding.js', 'Create Wallet', 'New');
        const newWallet = await createDecredWallet(generateMnemonic());
        updateDecredState('wallets', [...wallets, newWallet]);
    }

    const handleInput = e => {
        const { value } = e.target;

        // Validate mnemonic on change
        // Import button should be disabled unless mnemonic is valid
        setIsValidMnemonic(validateMnemonic(value));

        setImportedMnemonic(value);
    };

    return (
        <>
            {showImportWalletModal && (
                <Modal
                    height={198}
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

            <WelcomeCtn>
                <h2>Welcome to Decred!</h2>
                <WelcomeText>
                    Decred is an{' '}
                    <WelcomeLink
                        href="https://github.com/decred"
                        target="_blank"
                        rel="noreferrer"
                    >
                        open source,
                    </WelcomeLink>{' '}
                    non-custodial web wallet for {appConfig.name}.
                </WelcomeText>

                <PrimaryButton onClick={() => createNewWallet()}>
                    New Wallet
                </PrimaryButton>

                <SecondaryButton onClick={() => setShowImportWalletModal(true)}>
                    Import Wallet
                </SecondaryButton>
            </WelcomeCtn>
        </>
    );
};

export default OnBoarding;
