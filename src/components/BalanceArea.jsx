import { syncDecredWalletData, toDCR } from '../wallet/index';
import appConfig from '../config/app';
import { BN } from 'slp-mdm';
import {
  supportedFiatCurrencies,
} from '../config/cashtabSettings';
import { DerivationPath } from "../utils/const";
import { IconButton } from './common/Buttons';
import { SyncIcon } from './common/CustomIcons';

export default function BalanceArea({
  wallets,
  settings,
  fiatPrice = null,
  userLocale = 'en-US',
  updateDecredState,
}) {
  userLocale = typeof userLocale === 'undefined' ? 'en-US' : userLocale;
  const wallet = wallets[0]
  const balanceSats = wallet.state.balanceSats
  const renderBalanceHeader = Number.isInteger(balanceSats);
  const renderFiatValues = typeof fiatPrice === 'number';
  let balanceDCR,
    formattedBalanceDCR,
    afterDecimalDisplay,
    formattedBalanceFiat,
    formattedExchangeRate;
  if (renderBalanceHeader) {
    // Display XEC balance formatted for user's browser locale
    balanceDCR = toDCR(balanceSats);
    const balanceFloor = Math.floor(balanceSats / 1e6)
    formattedBalanceDCR = new BN(balanceFloor).div(1e2).toNumber().toFixed(2)

    const afterNumber = balanceDCR - formattedBalanceDCR
    const afterStr = afterNumber.toLocaleString(userLocale, {
      minimumFractionDigits: appConfig.cashDecimals,
      maximumFractionDigits: appConfig.cashDecimals,
    });
    const numArr = afterStr.split(afterStr.includes(',') ? ',' : '.')
    afterDecimalDisplay = ''
    if (numArr.length >= 2) {
      const afterDecimal = numArr[1]
      if (afterDecimal.length > 2) {
        afterDecimalDisplay = afterDecimal.substring(2)
      }
    }
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

  const syncWalletData = async wallet => {
    wallet.syncWallet = false
    await syncDecredWalletData(wallet, wallets, updateDecredState)
    wallet.syncPercent = 100
    updateDecredState('wallets', [
      wallet,
      ...wallets.slice(1),
    ]);
  }
  return (
    <div className="card card-padding-increase mt-4">
      <div className='flex-center ai-center'>
        <img src="/images/dcr.png" className='me-2' alt="decred" width="25" height="25" />
        <span className='fs-25 me-2'>Decred</span>
        {wallet.syncWallet ? (<>
          <img src="/images/sync.svg" alt="Sync wallet data" width="20" height="20" title={`Sync wallet data`} class="cursor-pointer ms-2"
          onClick={() => { syncWalletData(wallet) }} />
          </>) : (<></>)}
      </div>
      {wallet.syncWallet ? (<>
        <h3 className="flex-center cardTitle ai-end mt-1"> {formattedBalanceDCR}<span className="fs-17 pb-3px me-1">{afterDecimalDisplay}</span> {appConfig.ticker}</h3>
        <p className="flex-center my-1">~{supportedFiatCurrencies[settings.fiatCurrency].symbol}{formattedBalanceFiat}&nbsp;
          {supportedFiatCurrencies[
            settings.fiatCurrency
          ].slug.toUpperCase()}</p>
        <p className="flex-center exchange-text my-1">1 {appConfig.ticker} = {formattedExchangeRate}{' '}{settings.fiatCurrency.toUpperCase()}</p>
      </>) : (<>
        <p className="flex-center my-1">{wallet.syncPercent <= 40 ? 'Initializing address list... ' : 'Fetching data from API... '}{wallet.syncPercent ? wallet.syncPercent.toFixed(2) : 0}%</p>
        <div id="progressbar">
          <div id="currentProgress" style={{ width: (wallet.syncPercent ? wallet.syncPercent : 0) + '%' }}></div>
        </div>
      </>)}
    </div>
  )
}