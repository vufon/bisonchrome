import React from 'react';
import { QRCode } from './QRCode';
import styled from 'styled-components';
import { WalletContext } from '../wallet/context';
import { DerivationPath } from '../utils/const';
const QrCodeCtn = styled.div``;

export const ReceiveCtn = styled.div`
    width: 100%;
    h2 {
        color: ${props => props.theme.contrast};
        margin: 0 0 20px;
        margin-top: 10px;
    }
    ${QrCodeCtn} {
        padding-top: 12px;
    }
`;

export default function AddressQR() {
  const ContextValue = React.useContext(WalletContext);
  const { decredState } = ContextValue;
  const { wallets } = decredState;
  const wallet = wallets.length > 0 ? wallets[0] : false;
  const width = 500
  const height = 600
  const getQrCodeWidth = windowWidthPx => {
    const CASHTAB_FULLSCREEN_WIDTH = 500;
    if (windowWidthPx > CASHTAB_FULLSCREEN_WIDTH) {
      // Good width for no scrolling, taking all available space
      return 420;
    }
    // Extension or related
    /// Weird height to see normally so make this a tightly-focused condition
    if (width <= 400 && height <= 600) {
      return 250;
    }
    // Otherwise return with constant padding relative to width
    const CASHTAB_MOBILE_QR_PADDING = 75;
    return windowWidthPx - CASHTAB_MOBILE_QR_PADDING;
  };

  return (
    <ReceiveCtn title="Receive">
      {wallet !== false && (
        <QrCodeCtn title="QR Code">
          <QRCode
            address={wallet.paths[DerivationPath()].address}
            size={getQrCodeWidth(width)}
            logoSizePx={width >= 500 ? 48 : 24}
          />
        </QrCodeCtn>
      )}
    </ReceiveCtn>
  )
}