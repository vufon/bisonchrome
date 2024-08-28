// Copyright (c) 2024 The Bitcoin developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import React, { useState } from 'react';
import {
    TxWrapper,
    MainRow,
    TxDescCol,
    TxDesc,
    Timestamp,
    AmountCol,
    AmountTop,
    AmountBottom,
    Expand,
    MainRowLeft,
    Collapse,
    TxDescSendRcvMsg,
    FeeRow,
    TxExpandInfo,
} from './styles';
import {
    SendIcon,
    ReceiveIcon,
    MinedIcon,
} from '../common/CustomIcons';
import { toast } from 'react-toastify';
import { CopyIconButton } from '../common/Buttons';
import Modal from '../common/Modal';
import { ModalInput } from '../common/Inputs';
import { getContactNameError } from '../../validation';
import { parseTxData, toDCR } from '../../wallet';
import { toFormattedXec } from '../../utils/formatting';
import { supportedFiatCurrencies } from '../../config/cashtabSettings';
import { getExplorerURL } from '../../explib';
import { truncate } from '../../utils/helpers';
import moment from 'moment';
import appConfig from '../../config/app';

const Tx = ({
    tx,
    wallet,
    fiatPrice,
    fiatCurrency,
    decredState,
    updateDecredState,
    userLocale = 'en-US',
}) => {
    const emptyFormData = {
        newContactName: '',
    };
    const emptyFormDataErrors = {
        newContactName: false,
    };
    const { txid } = tx;
    const txData = parseTxData(wallet, tx)
    let xecTxType = txData.isSend ? 'Sent' : 'Received'
    let satoshisSent = txData.amount
    const timeDisp = moment.unix(txData.time).format("MM/DD/YYYY HH:mm")
    // let time = new Date(txData.time * 1000)
    let replyAddress, knownSender, knownRecipient;
    const { cashtabCache, contactList } = decredState;
    const [formData, setFormData] = useState(emptyFormData);
    const [formDataErrors, setFormDataErrors] = useState(emptyFormDataErrors);
    const [showAddNewContactModal, setShowAddNewContactModal] = useState(false);
    const [showPanel, setShowPanel] = useState(false);
    const senderOrRecipientNotInContacts =
        (xecTxType === 'Received' && typeof knownSender === 'undefined') ||
        (xecTxType === 'Sent' &&
            typeof knownRecipient === 'undefined')


    const addNewContact = async addressToAdd => {
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
                name: formData.newContactName,
                address: addressToAdd,
            });
            // update localforage and state
            await updateDecredState('contactList', contactList);
            toast.success(
                `${formData.newContactName} (${addressToAdd}) added to Contact List`,
            );
        }

        // Reset relevant state fields
        setShowAddNewContactModal(false);

        // Clear new contact formData
        setFormData(previous => ({
            ...previous,
            newContactName: '',
        }));
    };

    const handleInput = e => {
        const { name, value } = e.target;

        if (name === 'newContactName') {
            const contactNameError = getContactNameError(value, contactList);
            setFormDataErrors(previous => ({
                ...previous,
                [name]: contactNameError,
            }));
        }
        setFormData(previous => ({
            ...previous,
            [name]: value,
        }));
    };

    return (
        <>
            {showAddNewContactModal && (
                <Modal
                    height={180}
                    title={`Add new contact`}
                    handleOk={
                        xecTxType === 'Sent' && addNewContact(replyAddress)
                    }
                    handleCancel={() => setShowAddNewContactModal(false)}
                    showCancelButton
                >
                    <ModalInput
                        placeholder="Enter new contact name"
                        name="newContactName"
                        value={formData.newContactName}
                        error={formDataErrors.newContactName}
                        handleInput={handleInput}
                    />
                </Modal>
            )}
            <TxWrapper>
                <Collapse onClick={() => setShowPanel(!showPanel)}>
                    <MainRow type={xecTxType}>
                        <MainRowLeft>
                            {xecTxType === 'Received' ? (
                                <ReceiveIcon />
                            ) : xecTxType === 'Sent' ? (
                                <SendIcon />
                            ) : (
                                <MinedIcon />
                            )}
                            <TxDescCol>
                                <TxDesc>
                                    <TxDescSendRcvMsg>
                                        <a className='white-text' href={`${getExplorerURL()}/tx/` + txid} target='_blank'>{truncate(txid, 30)}</a>
                                    </TxDescSendRcvMsg>
                                </TxDesc>
                                <Timestamp>{timeDisp}</Timestamp>
                            </TxDescCol>
                        </MainRowLeft>
                        <AmountCol>
                            <AmountTop>
                                <>
                                    {xecTxType === 'Sent' ? '-' : ''}
                                    {toFormattedXec(satoshisSent, userLocale,)}{' '}DCR
                                </>
                            </AmountTop>
                            <AmountBottom>
                                <CopyIconButton
                                    style={{ zIndex: '2' }}
                                    name={`Copy txid`}
                                    data={txid}
                                    showToast
                                />
                            </AmountBottom>
                        </AmountCol>
                    </MainRow>
                </Collapse>
                <Expand showPanel={showPanel} isSent={xecTxType === 'Sent'}>
                    {xecTxType === 'Sent' ? (
                        <>
                            <div>
                                <p className="exchange-text my-1">Fee: -
                                    {toDCR(txData.fee).toLocaleString(userLocale, {
                                        maximumFractionDigits: appConfig.cashDecimals,
                                        minimumFractionDigits: appConfig.cashDecimals,
                                    })}{' '}
                                    DCR</p>
                            </div>
                        </>
                    ) : (
                        <></>
                    )}
                    <TxExpandInfo>
                        <p className="exchange-text my-1">Exchange Amount:  {xecTxType === 'Sent' ? '-' : ''}
                            {
                                supportedFiatCurrencies[
                                    fiatCurrency
                                ].symbol
                            }
                            {(
                                fiatPrice * toDCR(satoshisSent)
                            ).toLocaleString(userLocale, {
                                maximumFractionDigits: 2,
                                minimumFractionDigits: 2,
                            })} (Now)</p>
                        <p className="exchange-text my-1">Confirmations:  {txData.confirmations}</p>
                    </TxExpandInfo>
                    <TxExpandInfo>
                        <p className="exchange-text my-1">Inputs: {txData.vin.length}</p>
                        <p className="exchange-text my-1">Outputs: {txData.vout.length}</p>
                    </TxExpandInfo>
                </Expand>
            </TxWrapper >
        </>
    );
};

export default Tx;
