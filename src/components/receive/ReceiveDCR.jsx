import { createNewWalletAddress } from "../../wallet";
import { WalletContext } from "../../wallet/context";
import AddressQR from "../AddressQR";
import PrimaryButton from "../common/Buttons";
import { StyledSpacer } from "../configure/Configure";
import { HomeBackupArea } from "../Home";
import { WalletButtonRow } from "../wallets/styles";
import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function ReceiveDCR() {
  const ContextValue = React.useContext(WalletContext);
  const { updateDecredState, decredState } = ContextValue;
  const { wallets } = decredState;
  const wallet = wallets.length > 0 ? wallets[0] : false;
  const createNewAddress = async () => {
    const createOK = await createNewWalletAddress(wallet, wallets, updateDecredState)
    if (createOK) {
      toast.success('Create new address successfully')
    } else {
      toast.error('Create new address failed')
    }
  }
  return (
    <HomeBackupArea>
      <AddressQR />
      <StyledSpacer />
      <WalletButtonRow>
        <PrimaryButton onClick={() => createNewAddress()}>
          New Address
        </PrimaryButton>
      </WalletButtonRow>
    </HomeBackupArea>
  )
}