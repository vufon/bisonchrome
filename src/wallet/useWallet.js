// Copyright (c) 2024 The Bitcoin developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import React, { useState, useEffect, useRef } from 'react';
import {
    isValidCashtabSettings,
    isValidCashtabCache,
    migrateLegacyCashtabSettings,
} from '../validation';
import localforage from 'localforage';
import appConfig from '../config/app';
import { CashReceivedNotificationIcon } from '../components/common/CustomIcons';
import { supportedFiatCurrencies } from '../config/cashtabSettings';
import {
    cashtabCacheToJSON,
    storedCashtabCacheToMap,
    cashtabWalletsFromJSON,
    cashtabWalletsToJSON,
} from '../utils/helpers';
import { toast } from 'react-toastify';
import DecredState from '../config/DecredState';
import { getUserLocale } from '../utils/helpers';

const useWallet = () => {
    const [cashtabLoaded, setCashtabLoaded] = useState(false);
    const [ws, setWs] = useState(null);
    const [fiatPrice, setFiatPrice] = useState(null);
    const [apiError, setApiError] = useState(false);
    const [checkFiatInterval, setCheckFiatInterval] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aliases, setAliases] = useState({
        registered: [],
        pending: [],
    });
    const [aliasPrices, setAliasPrices] = useState(null);
    const [aliasServerError, setAliasServerError] = useState(false);
    const [aliasIntervalId, setAliasIntervalId] = useState(null);
    const [chaintipBlockheight, setChaintipBlockheight] = useState(0);
    const [decredState, setDecredState] = useState(new DecredState());
    const locale = getUserLocale();

    // Ref https://stackoverflow.com/questions/53446020/how-to-compare-oldvalues-and-newvalues-on-react-hooks-useeffect
    // Get the previous value of a state variable
    const usePrevious = value => {
        const ref = useRef();
        useEffect(() => {
            ref.current = value;
        }, [value]);
        return ref.current;
    };

    const prevFiatPrice = usePrevious(fiatPrice);
    const prevFiatCurrency = usePrevious(decredState.settings.fiatCurrency);

    const update = async decredState => {
        if (!cashtabLoaded) {
            // Wait for cashtab to get state from localforage before updating
            return;
        }
    };

    /**
     * Lock UI while you update decredState in state and indexedDb
     * @param {key} string
     * @param {object} value what is being stored at this key
     * @returns {boolean}
     */
    const updateDecredState = async (key, value) => {
        // If we are dealing with savedWallets, sort alphabetically by wallet name
        if (key === 'savedWallets') {
            value.sort((a, b) => a.name.localeCompare(b.name));
        }

        // Update the changed key in state
        setDecredState({ ...decredState, [`${key}`]: value });

        // Update the changed key in localforage

        // Handle any items that must be converted to JSON before storage
        // For now, this is just cashtabCache
        if (key === 'cashtabCache') {
            value = cashtabCacheToJSON(value);
        }
        if (key === 'wallets') {
            value = cashtabWalletsToJSON(value);
        }
        // We lock the UI by setting loading to true while we set items in localforage
        // This is to prevent rapid user action from corrupting the db
        setLoading(true);
        await localforage.setItem(key, value);
        setLoading(false);

        return true;
    };

    /**
     * Load all keys from localforage into state
     *
     * If any are invalid, migrate them to valid and update in storage
     *
     * We only do this when the user starts Cashtab
     *
     * While the app is running, we use cashtabState as the source of truth
     *
     * We save to localforage on state changes in updateCashtabState
     * so that these persist if the user navigates away from Cashtab     *
     */
    const loadDecredState = async () => {
        // cashtabState is initialized with defaults when this component loads
        // settings
        let settings = await localforage.getItem('settings');
        if (settings !== null) {
            // If we find settings in localforage
            if (!isValidCashtabSettings(settings)) {
                // If a settings object is present but invalid, parse to find and add missing keys
                settings = migrateLegacyCashtabSettings(settings);
                // Update localforage on app load only if existing values are in an obsolete format
                updateDecredState('settings', settings);
            }

            // Set cashtabState settings to valid localforage or migrated settings
            decredState.settings = settings;
        }

        // cashtabCache
        let cashtabCache = await localforage.getItem('cashtabCache');

        if (cashtabCache !== null) {
            // If we find cashtabCache in localforage

            // cashtabCache must be converted from JSON as it stores a Map
            cashtabCache = storedCashtabCacheToMap(cashtabCache);

            if (!isValidCashtabCache(cashtabCache)) {
                // If a cashtabCache object is present but invalid, nuke it and start again
                cashtabCache = decredState.cashtabCache;
                // Update localforage on app load only if existing values are in an obsolete format
                updateDecredState('cashtabCache', cashtabCache);
            }

            // Set decredState cashtabCache to valid localforage or migrated settings
            decredState.cashtabCache = cashtabCache;
        }

        // Load wallets if present
        // Make sure case of nothing at wallet or wallets is handled properly

        // A legacy Cashtab user may have the active wallet stored at the wallet key
        let wallet = await localforage.getItem('wallet');

        // After version 1.7.x, Cashtab users have all wallets stored at the wallets key
        let wallets = await localforage.getItem('wallets');
        /**
         * Possible cases
         *
         * 1 - NEW CASHTAB USER
         * wallet === null && wallets === null
         * nothing in localforage for wallet or wallets
         *
         * 2 - PARTIALLY MIGRATED CASHTAB USER
         * wallet !== null && wallets !== null
         * User first used Cashtab.com on legacy wallet/savedWallet keys
         * but has now been migrated to use the wallets key
         * No action required, load as normal. We could delete the legacy keys
         * but we do not need the space so there is no expected benefit
         *
         * 3 - FULLY MIGRATED CASHTAB USER
         * wallet === null && wallets !== null
         * User created first wallet at Cashtab 1.7.0 or higher
         *
         * 4 - MIGRATION REQUIRED
         * wallet !== null && wallets === null
         * User has stored wallet information at old keys
         * wallet for active wallet
         * savedWallets for savedWallets
         * Migrate to wallets key
         */

        const legacyMigrationRequired = wallet !== null && wallets === null;

        if (legacyMigrationRequired) {
            // Initialize wallets array
            wallets = [];
            // wallets[0] is the active wallet in upgraded Cashtab localforage model
            wallets.push(wallet);

            // Also migrate savedWallets
            let savedWallets = await localforage.getItem('savedWallets');

            if (savedWallets !== null) {
                // If we find savedWallets in localforage

                // Because Promise.all() will not preserve order, sort savedWallets alphabetically by name
                savedWallets.sort((a, b) => a.name.localeCompare(b.name));

                // In legacy Cashtab storage, the key savedWallets also stored the active wallet
                // Delete wallet from savedWallets
                const indexOfSavedWalletMatchingWallet = savedWallets.findIndex(
                    savedWallet => savedWallet.mnemonic === wallet.mnemonic,
                );
                savedWallets.splice(indexOfSavedWalletMatchingWallet, 1);

                // Update wallets array to include legacy wallet and legacy savedWallets
                // migrated to current Cashtab format
                wallets = wallets.concat(savedWallets);

                // Set cashtabState wallets to migrated wallet + savedWallets
                decredState.wallets = wallets;

                // We do not updateCashtabState('wallets', wallets) here
                // because it will happen in the update routine as soon as
                // the active wallet is populated
            }
        } else {
            // Load from wallets key, or initialize new user

            // If the user has already migrated, we load wallets from localforage key directly

            if (wallets !== null) {
                // If we find wallets in localforage
                // In this case, we do not need to migrate from the wallet and savedWallets keys
                // We may or may not need to migrate wallets found at the wallets key to a new format

                // Revive from storage
                wallets = cashtabWalletsFromJSON(wallets);

                // Because Promise.all() will not preserve order, sort wallets alphabetically by name
                // First remove wallets[0] as this is the active wallet and we do not want to sort it
                const activeWallet = wallets.shift();
                // Sort other wallets alphabetically
                wallets.sort((a, b) => a.name.localeCompare(b.name));
                // Replace the active wallet at the 0-index
                wallets.unshift(activeWallet);

                // Set cashtabState wallets to wallets from localforage
                // (or migrated wallets if localforage included any invalid wallet)
                decredState.wallets = wallets;

                // We do not updateCashtabState('wallets', wallets) here
                // because it will happen in the update routine as soon as
                // the active wallet is populated
            }

            // So, if we do not find wallets from localforage, cashtabState will be initialized with default
            // wallets []
        }
        setDecredState(decredState);
        setCashtabLoaded(true);
        // When the user creates or imports a wallet, ws subscriptions will be handled by updateWebsocket
    };

    // With different currency selections possible, need unique intervals for price checks
    // Must be able to end them and set new ones with new currencies
    const initializeFiatPriceApi = async selectedFiatCurrency => {
        // Update fiat price and confirm it is set to make sure ap keeps loading state until this is updated

        // Call this instance with showNotifications = false,
        // as we do not want to calculate price deltas when the user selects a new foreign currency
        await fetchXecPrice(selectedFiatCurrency);
        // Set interval for updating the price with given currency

        // Now we call with showNotifications = true, as we want
        // to show price changes when the currency has not changed
        const thisFiatInterval = setInterval(function () {
            fetchXecPrice(selectedFiatCurrency);
        }, appConfig.fiatUpdateIntervalMs);

        // set interval in state
        setCheckFiatInterval(thisFiatInterval);
    };

    const clearFiatPriceApi = fiatPriceApi => {
        // Clear fiat price check interval of previously selected currency
        clearInterval(fiatPriceApi);
    };

    const fetchXecPrice = async (
        fiatCode = typeof decredState?.settings?.fiatCurrency !== 'undefined'
            ? decredState.settings.fiatCurrency
            : 'usd',
    ) => {
        // Split this variable out in case coingecko changes
        const cryptoId = appConfig.coingeckoId;
        // Keep this in the code, because different URLs will have different outputs require different parsing
        const priceApiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=${fiatCode}&include_last_updated_at=true`;
        try {
            const xecPrice = await fetch(priceApiUrl);
            const xecPriceJson = await xecPrice.json();
            let xecPriceInFiat = xecPriceJson[cryptoId][fiatCode];

            if (typeof xecPriceInFiat === 'number') {
                // If we have a good fetch
                return setFiatPrice(xecPriceInFiat);
            }
        } catch (err) {
            if (err.message === 'Failed to fetch') {
                // The most common error is coingecko 429
                console.error(
                    `Failed to fetch XEC Price: Bad response or rate limit from CoinGecko`,
                );
            } else {
                console.error(`Failed to fetch XEC Price`, err);
            }
        }
        // If we have an error in the price fetch, or an invalid type without one, do not set the price
        return setFiatPrice(null);
    };

    const cashtabBootup = async () => {
        await loadDecredState();
    };

    useEffect(() => {
        cashtabBootup();
    }, []);

    // Call the update loop every time the user changes the active wallet
    // and immediately after cashtab is loaded
    useEffect(() => {
        if (cashtabLoaded !== true || decredState.wallets.length === 0) {
            // Do not update the active wallet unless
            // 1. Cashtab is loaded
            // 2. You have a valid active wallet in cashtabState
            return;
        }
        update(decredState);
    }, [cashtabLoaded, decredState.wallets[0]?.name]);

    // Clear price API and update to new price API when fiat currency changes
    useEffect(() => {
        if (cashtabLoaded !== true) {
            // Wait for Cashtab to load the user's fiat currency from saved settings before starting the price API
            return;
        }
        // Clear existing fiat price API check
        clearFiatPriceApi(checkFiatInterval);
        // Reset fiat price API when fiatCurrency setting changes
        initializeFiatPriceApi(decredState.settings.fiatCurrency);
    }, [cashtabLoaded, decredState.settings.fiatCurrency]);

    /**
     * useEffect
     * Depends on fiatPrice and user-set fiatCurrency
     * Used to trigger price notifications at new fiatPrice milestones
     * Optimized for USD
     * Also supports EUR and GBP as these are "close enough", for now anyway
     */
    useEffect(() => {
        // Do nothing if the user has just changed the fiat currency
        if (decredState.settings.fiatCurrency !== prevFiatCurrency) {
            return;
        }

        // We only support currencies that are similar order of magnitude to USD
        // USD is the real referencce for "killed zero"
        const FIAT_CHANGE_SUPPORTED_CURRENCIES = [
            'usd',
            'eur',
            'gbp',
            'cad',
            'aud',
        ];
        if (
            !FIAT_CHANGE_SUPPORTED_CURRENCIES.includes(
                decredState.settings.fiatCurrency,
            )
        ) {
            return;
        }
        // Otherwise we do support them
        if (fiatPrice === null || prevFiatPrice === null) {
            return;
        }
        const priceIncreased = fiatPrice - prevFiatPrice > 0;
        if (priceIncreased) {
            // We only show price notifications if price has increased
            // "tens" for USD price per 1,000,000 XEC
            const prevTens = parseInt(Math.floor(prevFiatPrice * 1e5));
            const tens = parseInt(Math.floor(fiatPrice * 1e5));
            if (tens > prevTens) {
                // We have passed a $10 milestone
                toast(
                    `XEC is now ${
                        supportedFiatCurrencies[
                            decredState.settings.fiatCurrency
                        ].symbol
                    }${fiatPrice} ${decredState.settings.fiatCurrency.toUpperCase()}`,
                    { icon: CashReceivedNotificationIcon },
                );
            }
            if (tens >= 10 && prevTens < 10) {
                // We have killed a zero
                toast(`ZERO KILLED 🔫🔫🔫🔪🔪🔪`, {
                    autoClose: false,
                    icon: CashReceivedNotificationIcon,
                });
            }
        }
    }, [fiatPrice, decredState.settings.fiatCurrency]);

    // Update websocket subscriptions and websocket onMessage handler whenever
    // 1. cashtabState changes
    // 2. or the fiat price updates (the onMessage handler needs to have the most up-to-date
    // fiat price)
    // This is because the onMessage routine only has access to the state variables when onMessage was set
    // and the update() function needs the most recent cashtabState to update cashtabState
    useEffect(() => {
        if (
            cashtabLoaded !== true ||
            ws === null ||
            typeof decredState.wallets[0] === 'undefined'
        ) {
            // Only update the websocket if
            // 1. ws is not null
            // 2. Cashtab has loaded
            // 3. We have an active wallet
            // 4. fiatPrice has changed
            // We can call with fiatPrice of null, we will not always have fiatPrice
            return;
        }
    }, [decredState, fiatPrice, ws, cashtabLoaded]);

    useEffect(() => {
        if (
            aliases?.pending?.length > 0 &&
            aliasIntervalId === null &&
            typeof decredState.wallets !== 'undefined' &&
            decredState.wallets.length > 0
        ) {
            // If
            // 1) aliases are enabled in Cashtab
            // 2) we have pending aliases
            // 3) No interval is set to watch these pending aliases
            // 4) We have an active wallet
            // Set an interval to watch these pending aliases
        } else if (aliases?.pending?.length === 0 && aliasIntervalId !== null) {
            // If we have no pending aliases but we still have an interval to check them, clearInterval
            clearInterval(aliasIntervalId);
        }
    }, [decredState.wallets[0]?.name, aliases]);

    return {
        chaintipBlockheight,
        fiatPrice,
        cashtabLoaded,
        loading,
        apiError,
        aliases,
        setAliases,
        aliasServerError,
        setAliasServerError,
        aliasPrices,
        setAliasPrices,
        updateDecredState,
        decredState,
    };
};

export default useWallet;
