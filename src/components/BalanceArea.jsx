import { useEffect, useState, useRef } from "react";
import { toDCR, toSatoshis } from '../wallet/index';
import appConfig from '../config/app';
import { toFormattedXec } from '../utils/formatting';
import { getWalletsForNewActiveWallet } from '../wallet/index'
import {
  CashtabSettings,
  supportedFiatCurrencies,
} from '../config/cashtabSettings';
import debounce from 'lodash.debounce';
import { toast } from 'react-toastify';
import { DerivationPath } from "../utils/const";

export default function BalanceArea({
  wallets,
  settings,
  updateDecredState,
  fiatPrice = null,
  userLocale = 'en-US',
}) {
  userLocale = typeof userLocale === 'undefined' ? 'en-US' : userLocale;
  const balanceSats = wallets[0].state.balanceSats
  const address = wallets[0].paths[DerivationPath()].address;
  const renderBalanceHeader = Number.isInteger(balanceSats);
  const renderFiatValues = typeof fiatPrice === 'number';
  let balanceDCR,
    formattedBalanceDCR,
    formattedBalanceFiat,
    formattedExchangeRate;
  if (renderBalanceHeader) {
    // Display XEC balance formatted for user's browser locale
    balanceDCR = toDCR(balanceSats);

    formattedBalanceDCR = balanceDCR.toLocaleString(userLocale, {
      minimumFractionDigits: appConfig.cashDecimals,
      maximumFractionDigits: appConfig.cashDecimals,
    });

    if (renderFiatValues) {
      // Display fiat balance formatted for user's browser locale
      formattedBalanceFiat = (balanceDCR * fiatPrice).toLocaleString(
        userLocale,
        {
          minimumFractionDigits: appConfig.fiatDecimals,
          maximumFractionDigits: appConfig.fiatDecimals,
        },
      );

      // Display exchange rate formatted for user's browser locale
      formattedExchangeRate = fiatPrice.toLocaleString(userLocale, {
        minimumFractionDigits: appConfig.fiatDecimals,
        maximumFractionDigits: appConfig.fiatDecimals,
      });
    }
  }

  const debouncedActivateNewWallet = useRef(
    debounce(walletsAfterActivation => {
      // Event("Category", "Action", "Label
      // Track number of times a different wallet is activated
      // Event('App.js', 'Activate', '');
      // Update wallets to activate this wallet
      updateDecredState('wallets', walletsAfterActivation);
    }, 500),
  ).current;

  const handleSelectWallet = (e) => {
    const walletName = e.target.dataset.name
    // Get the active wallet by name
    const walletToActivate = wallets.find(
      wallet => wallet.name === walletName,
    );

    if (typeof walletToActivate === 'undefined') {
      return;
    }
    // Get desired wallets array after activating walletToActivate
    const walletsAfterActivation = getWalletsForNewActiveWallet(
      walletToActivate,
      wallets,
    );
    debouncedActivateNewWallet(walletsAfterActivation);
  };
  return (
    <div className="card card-padding-increase mt-4">
      <div className="d-flex justify-content-center align-items-center">
        <div class="dropdown bg-transparent">
          <button class="btn btn-secondary dropdown-toggle bg-transparent account-dropdown" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
            {wallets[0].name}
          </button>
          <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
            {wallets.map((wallet, index) => (
              <li><a class="dropdown-item" data-name={wallet.name} onClick={handleSelectWallet}>{wallet.name}</a></li>
            ))}
          </ul>
        </div>
        <img src="/images/copy-icon.svg" alt="Open in tab" width="25" height="25" title={`Copy address of ${wallets[0].name}`} class="cursor-pointer ms-2" onClick={() => {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(address);
          }
          toast.success(`"${address}" copied to clipboard`);
        }} />
      </div>
      <h3 className="flex-center cardTitle mt-3"> {formattedBalanceDCR} {appConfig.ticker}</h3>
      <p className="flex-center my-1">{supportedFiatCurrencies[settings.fiatCurrency].symbol}{formattedBalanceFiat}&nbsp;
        {supportedFiatCurrencies[
          settings.fiatCurrency
        ].slug.toUpperCase()}</p>
      <p className="flex-center exchange-text my-1">1 {appConfig.ticker} = {formattedExchangeRate}{' '}{settings.fiatCurrency.toUpperCase()}</p>
    </div>
  )
}