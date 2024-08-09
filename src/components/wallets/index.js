// Copyright (c) 2024 The Bitcoin developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import React, { useState } from 'react';
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
import { createDecredWallet, getWalletsForNewActiveWallet } from '../../wallet/index'
import { WalletContext } from '../../wallet/context';
import { toast } from 'react-toastify';
import { toFormattedXec } from '../../utils/formatting';
import { getUserLocale } from '../../utils/helpers';
import Modal from '../../components/common/Modal';
import { getWalletNameError, validateMnemonic } from '../../validation';
import { ModalInput } from '../../components/common/Inputs';
import debounce from 'lodash.debounce';
import { DerivationPath } from '../../utils/const';

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
    const { wallets, contactList } = decredState;
    const emptyFormDataErrors = {
        renamedWalletName: false,
        walletToBeDeletedName: false,
        newWalletName: false,
        mnemonic: false,
    };
    const emptyFormData = {
        renamedWalletName: '',
        walletToBeDeletedName: '',
        newWalletName: '',
        mnemonic: '',
    };
    const [formData, setFormData] = useState(emptyFormData);
    const [formDataErrors, setFormDataErrors] = useState(emptyFormDataErrors);
    const [walletToBeDeleted, setWalletToBeDeleted] = useState(null);
    const [showImportWalletModal, setShowImportWalletModal] = useState(false);
    const [walletToBeRenamed, setWalletToBeRenamed] = useState(null);
    const userLocale = getUserLocale(navigator);
    async function createWallet() {
        //const wallet = CoinKey.createRandom(CoinInfo("dcr").versions);
        const newWallet = await createDecredWallet()
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
    }

    const handleInput = e => {
        const { name, value } = e.target;

        if (name === 'renamedWalletName') {
            setFormDataErrors(previous => ({
                ...previous,
                [name]: getWalletNameError(value, wallets),
            }));
        }
        if (name === 'walletToBeDeletedName') {
            const walletToBeDeletedNameError =
                value === 'delete ' + walletToBeDeleted.name
                    ? false
                    : `Input must exactly match "delete ${walletToBeDeleted.name}"`;
            setFormDataErrors(previous => ({
                ...previous,
                [name]: walletToBeDeletedNameError,
            }));
        }
        if (name === 'mnemonic') {
            setFormDataErrors(previous => ({
                ...previous,
                [name]:
                    validateMnemonic(value) === true
                        ? false
                        : 'Invalid mnemonic',
            }));
        }
        setFormData(previous => ({
            ...previous,
            [name]: value,
        }));
    };

    async function importNewWallet() {
        // Make sure no existing wallets have this mnemonic
        const walletInWallets = wallets.find(
            wallet => wallet.mnemonic === formData.mnemonic,
        );

        if (typeof walletInWallets !== 'undefined') {
            // Import error modal
            console.error(
                `Cannot import: wallet already exists (name: "${walletInWallets.name}")`,
            );
            toast.error(
                `Cannot import: wallet already exists (name: "${walletInWallets.name}")`,
            );
            // Do not clear form data in this case
            return;
        }

        // Create a new wallet from mnemonic
        const newImportedWallet = await createDecredWallet(formData.mnemonic);

        // Handle edge case of another wallet having the same name
        const existingWalletHasSameName = wallets.find(
            wallet => wallet.name === newImportedWallet.name,
        );
        if (typeof existingWalletHasSameName !== 'undefined') {
            // Import error modal for wallet existing with the same name
            console.error(
                `Cannot import: wallet with same name already exists (name: "${existingWalletHasSameName.name}")`,
            );
            toast.error(
                `Cannot import: wallet with same name already exists (name: "${existingWalletHasSameName.name}")`,
            );
            // Do not clear form data in this case
            return;
        }

        // Event("Category", "Action", "Label")
        // Track number of times a different wallet is activated
        //  Event('Configure.js', 'Create Wallet', 'Imported');

        // Add it to the end of the wallets object
        updateDecredState('wallets', [...wallets, newImportedWallet]);

        // Import success modal
        toast.success(
            `New imported wallet "${newImportedWallet.name}" added to your saved wallets`,
        );

        // Clear formdata
        setFormData({ ...formData, mnemonic: '' });

        // Close the modal
        setShowImportWalletModal(false);
    }

    const renameWallet = async () => {
        // Find the wallet you want to rename
        let walletToUpdate = wallets.find(
            wallet => wallet.mnemonic === walletToBeRenamed.mnemonic,
        );
        const oldName = walletToUpdate.name;

        // if a match was found
        if (typeof walletToUpdate !== 'undefined') {
            // update the walllet name
            walletToUpdate.name = formData.renamedWalletName;

            // Update localforage and state
            await updateDecredState('wallets', wallets);
            toast.success(
                `"${oldName}" renamed to "${formData.renamedWalletName}"`,
            );
        } else {
            toast.error(`Unable to find wallet ${walletToBeRenamed.name}`);
        }
        // Clear walletToBeRenamed field to hide the modal
        setWalletToBeRenamed(null);

        // Clear wallet rename input
        setFormData(previous => ({
            ...previous,
            renamedWalletName: '',
        }));
    };

    const deleteWallet = async () => {
        // filter wallet from wallets
        const updatedWallets = wallets.filter(
            wallet => wallet.mnemonic !== walletToBeDeleted.mnemonic,
        );

        // Update localforage and state
        await updateDecredState('wallets', updatedWallets);
        toast.success(`"${walletToBeDeleted.name}" deleted`);

        // Reset walletToBeDeleted to hide the modal
        setWalletToBeDeleted(null);

        // Clear wallet to delete input
        setFormData(previous => ({
            ...previous,
            walletToBeDeletedName: '',
        }));
    };

    const addWalletToContacts = async wallet => {
        const addressToAdd = wallet.paths[DerivationPath()].address;
        // Check to see if the contact exists
        const contactExists = contactList.find(
            contact => contact.address === addressToAdd,
        );

        if (typeof contactExists !== 'undefined') {
            // Contact exists
            // Not expected to ever happen from Tx.js as user should not see option to
            // add an existing contact
            toast.error(`${addressToAdd} already exists in Contacts`);
        } else {
            contactList.push({
                name: wallet.name,
                address: addressToAdd,
            });
            // update localforage and state
            await updateDecredState('contactList', contactList);
            toast.success(
                `${wallet.name} (${addressToAdd}) added to Contact List`,
            );
        }
    };

    const activateWallet = (walletToActivate, wallets) => {
        // Get desired wallets array after activating walletToActivate
        const walletsAfterActivation = getWalletsForNewActiveWallet(
            walletToActivate,
            wallets,
        );

        // Event("Category", "Action", "Label")
        // Track number of times a different wallet is activated
        //  Event('Configure.js', 'Activate', '');

        // Update wallets to activate this wallet
        updateDecredState('wallets', walletsAfterActivation);
    };

    return (
        <>
            {walletToBeRenamed !== null && (
                <Modal
                    height={180}
                    title={`Rename "${walletToBeRenamed.name}"?`}
                    handleOk={renameWallet}
                    handleCancel={() => setWalletToBeRenamed(null)}
                    showCancelButton
                    disabled={
                        formDataErrors.renamedWalletName !== false ||
                        formData.renamedWalletName === ''
                    }
                >
                    <ModalInput
                        placeholder="Enter new wallet name"
                        name="renamedWalletName"
                        value={formData.renamedWalletName}
                        error={formDataErrors.renamedWalletName}
                        handleInput={handleInput}
                    />
                </Modal>
            )}
            {showImportWalletModal && (
                <Modal
                    height={180}
                    title={`Import wallet`}
                    handleOk={importNewWallet}
                    handleCancel={() => setShowImportWalletModal(false)}
                    showCancelButton
                    disabled={
                        formDataErrors.mnemonic !== false ||
                        formData.mnemonic === ''
                    }
                >
                    <ModalInput
                        type="email"
                        placeholder="mnemonic (seed phrase)"
                        name="mnemonic"
                        value={formData.mnemonic}
                        error={formDataErrors.mnemonic}
                        handleInput={handleInput}
                    />
                </Modal>
            )}
            {walletToBeDeleted !== null && (
                <Modal
                    height={210}
                    title={`Delete "${walletToBeDeleted.name}"?`}
                    handleOk={deleteWallet}
                    handleCancel={() => setWalletToBeDeleted(null)}
                    showCancelButton
                    disabled={
                        formDataErrors.walletToBeDeletedName !== false ||
                        formData.walletToBeDeletedName === ''
                    }
                >
                    <ModalInput
                        placeholder={`Type "delete ${walletToBeDeleted.name}" to confirm`}
                        name="walletToBeDeletedName"
                        value={formData.walletToBeDeletedName}
                        handleInput={handleInput}
                        error={formDataErrors.walletToBeDeletedName}
                    />
                </Modal>
            )}
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
                                        data={wallet.paths[DerivationPath()].address}
                                        showToast
                                    />
                                    <IconButton
                                        name={`Rename ${wallet.name}`}
                                        icon={<EditIcon />}
                                        onClick={() =>
                                            setWalletToBeRenamed(wallet)
                                        }
                                    />
                                    <IconButton
                                        name={`Add ${wallet.name} to contacts`}
                                        icon={<AddContactIcon />}
                                        onClick={() =>
                                            addWalletToContacts(wallet)
                                        }
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
                                                data={wallet.paths[DerivationPath()].address}
                                                showToast
                                            />
                                            <IconButton
                                                name={`Rename ${wallet.name}`}
                                                icon={<EditIcon />}
                                                onClick={() =>
                                                    setWalletToBeRenamed(wallet)
                                                }
                                            />
                                            <IconButton
                                                name={`Add Account2 to contacts`}
                                                icon={<AddContactIcon />}
                                                onClick={() =>
                                                    addWalletToContacts(wallet)
                                                }
                                            />
                                            <IconButton
                                                name={`Delete ${wallet.name}`}
                                                icon={<TrashcanIcon />}
                                                onClick={() =>
                                                    setWalletToBeDeleted(wallet)
                                                }
                                            />
                                        </SvgButtonPanel>
                                        <ActivateButton
                                            aria-label={`Activate ${wallet.name}`}
                                            onClick={debounce(
                                                () =>
                                                    activateWallet(
                                                        wallet,
                                                        wallets,
                                                    ),
                                                500,
                                            )}
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
                    <SecondaryButton onClick={() => setShowImportWalletModal(true)}>
                        Import Wallet
                    </SecondaryButton>
                </WalletRow>
            </WalletsList>
        </>
    );
};

export default Wallets;
