// Copyright (c) 2024 The Bitcoin developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import QRCodeSVG from 'qrcode.react';
import CopyToClipboard from './common/CopyToClipboard';

export const CustomQRCode = styled(QRCodeSVG)`
 cursor: pointer;
    border-radius: 10px;
    background: ${props => props.theme.qr.background};
    margin: 12px;
    path:first-child {
        fill: ${props => props.theme.qr.background};
    }
    :hover {
        border-color: ${props => props.theme.qr.eCashBlue};
    }
    @media (max-width: 768px) {
        border-radius: 18px;
    }
`;

const Copied = styled.div`
    font-size: 24px;
    font-family: 'Roboto Mono', monospace;
    font-weight: bold;
    width: 100%;
    text-align: center;
    background-color: ${props => props.theme.eCashBlue};
    border: 1px solid;
    border-color: ${props => props.theme.eCashBlue};
    color: ${props => props.theme.contrast};
    position: absolute;
    top: 65px;
    padding: 30px 0;
`;
const PrefixLabel = styled.span`
    font-size: 18px;
    color: ${props => props.theme.eCashBlue};
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
`;
const AddressHighlightTrim = styled.span`
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
`;

const ReceiveAddressHolder = styled.div`
    width: 100%;
    font-size: 30px;
    font-weight: bold;
    color: ${props => props.theme.lightWhite};
    text-align: center;
    cursor: pointer;
    margin-bottom: 10px;
    padding: 0;
    font-family: 'Roboto Mono', monospace;
    border-radius: 5px;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    input {
        border: none;
        width: 100%;
        text-align: center;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        cursor: pointer;
        color: ${props => props.theme.contrast};
        padding: 10px 0;
        background: transparent;
        margin-bottom: 15px;
        display: none;
    }
    input:focus {
        outline: none;
    }
    input::selection {
        background: transparent;
        color: ${props => props.theme.contrast};
    }
`;

const DisplayCopiedAddress = styled.span`
    font-size: 24px;
    word-wrap: break-word;
`;

export const QRCode = ({
    address,
    size = 210,
    logoSizePx = 36,
    onClick = () => null,
}) => {
    address = address ? address : '';

    const [visible, setVisible] = useState(false);
    const trimAmount = 3;
    const handleOnClick = evt => {
        setVisible(true);
        setTimeout(() => {
            setVisible(false);
        }, 1500);
        onClick(evt);
    };

    return (
        <CopyToClipboard data={address}>
            <div
                style={{
                    display: 'inline-block',
                    width: '100%',
                    position: 'relative',
                }}
            >
                <div style={{ position: 'relative' }} onClick={handleOnClick}>
                    <Copied style={{ display: visible ? null : 'none' }}>
                        Address Copied to Clipboard
                        <br />
                        <DisplayCopiedAddress>
                          <div style={{ display: 'block' }} key={`address_slice_0`}>
                             <span className='fs-18'>{address}</span>
                          </div>
                        </DisplayCopiedAddress>
                    </Copied>

                    <CustomQRCode
                        title="Raw QR Code"
                        value={address || ''}
                        size={size}
                        renderAs={'svg'}
                        includeMargin
                        imageSettings={{
                            src: "images/logo-icon.png",
                            x: null,
                            y: null,
                            height: logoSizePx,
                            width: logoSizePx,
                            excavate: true,
                        }}
                    />

                    {address && (
                        <ReceiveAddressHolder className="notranslate">
                            <input
                                readOnly
                                value={address}
                                spellCheck="false"
                                type="text"
                            />
                            <PrefixLabel>
                                {address}
                            </PrefixLabel>
                        </ReceiveAddressHolder>
                    )}
                </div>
            </div>
        </CopyToClipboard>
    );
};

QRCode.propTypes = {
    address: PropTypes.string,
    size: PropTypes.number,
    logoSizePx: PropTypes.number,
    onClick: PropTypes.func,
};