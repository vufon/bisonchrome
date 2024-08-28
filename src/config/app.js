// Copyright (c) 2023-2024 The Bitcoin developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.
import mainLogo from '../static/images/logo-icon.png';
// App settings not adjustable by the user
const appConfig = {
    name: 'Decred',
    ticker: 'DCR',
    derivationPath: 42,
    testDerivationPath: 1,
    seedwords: 33, //17 or 33
    network: 'mainnet',
    logo: mainLogo,
    legacyPrefix: 'decred',
    exchangeId: 'decred',
    fiatUpdateIntervalMs: 90000,
    defaultFee: 2010, // satoshis per kb
    minFee: 1000, // satoshis per kb
    dustSats: 500000,
    cashDecimals: 8,
    fiatDecimals: 2,
    pricePrecisionDecimals: 2,
    tokenName: 'eToken',
    tokenTicker: 'eToken',
    localStorageMaxCharacters: 24,
    monitorExtension: false,
    vipTokens: {
        grumpy: {
            tokenId:
                'fb4233e8a568993976ed38a81c2671587c5ad09552dedefa78760deed6ff87aa',
            // decimalized string, i.e. one million GRP tokens
            vipBalance: '1000000',
        },
        cachet: {
            tokenId:
                'aed861a31b96934b88c0252ede135cb9700d7649f69191235087a3030e553cb1',
            // decimalized string, i.e. one thousand CACHET tokens
            vipBalance: '1000',
        },
    },
    defaultLocale: 'en-US',
};

export default appConfig;
