import appConfig from '../config/app';

export const getUserLocale = navigator => {
    if (typeof navigator?.language !== 'undefined') {
        return navigator.language;
    }
    return appConfig.defaultLocale;
};

/**
 * Call in a web browser. Return true if browser is on a mobile device.
 * Return false if browser is desktop or browser is too old to support navigator.userAgentData
 * @param {object | undefined} navigator
 * @returns {boolean}
 */
export const isMobile = navigator => {
    return (
        typeof navigator?.userAgentData?.mobile !== 'undefined' &&
        navigator.userAgentData.mobile === true
    );
};

export const cashtabCacheToJSON = cashtabCache => {
    return {
        ...cashtabCache,
        tokens: Array.from(cashtabCache.tokens.entries()),
    };
};

export const storedCashtabCacheToMap = storedCashtabCache => {
    return {
        ...storedCashtabCache,
        tokens: new Map(storedCashtabCache.tokens),
    };
};

export const cashtabWalletsFromJSON = storedWallets => {
    const wallets = [];
    for (const storedWallet of storedWallets) {
        wallets.push(cashtabWalletFromJSON(storedWallet));
    }
    console.log('check wallet list: ' + JSON.stringify(wallets))
    return wallets;
};

export const cashtabWalletsToJSON = wallets => {
    const jsonWallets = [];
    for (const wallet of wallets) {
        jsonWallets.push(cashtabWalletToJSON(wallet));
    }
    return jsonWallets;
};

export const cashtabWalletToJSON = cashtabWallet => {
    if (!(cashtabWallet.paths instanceof Map)) {
        // Cashtab wallets before 2.9.0 were already JSON
        // We do not plan to ever use this function on such a wallet
        // Handle so we can be sure no errors are thrown
        return cashtabWallet;
    }
    return {
        ...cashtabWallet,
        paths: Array.from(cashtabWallet.paths.entries()),
        state: {
            ...cashtabWallet.state,
            tokens: Array.from(cashtabWallet.state.tokens.entries()),
        },
    };
};

export const cashtabWalletFromJSON = storedCashtabWallet => {
    // If you are pulling a pre-2.9.0 wallet out of storage, no conversion necessary
    // Cashtab will find this wallet invalid and migrate it
    // But, you need to ber able to handle pulling old wallets from storage
    if (
        'Path1899' in storedCashtabWallet ||
        // Pre 2.9.0 wallet
        (Array.isArray(storedCashtabWallet.paths) &&
            storedCashtabWallet.paths.length > 0 &&
            typeof storedCashtabWallet.paths[0].path !== 'undefined')
    ) {
        return storedCashtabWallet;
    }
    return {
        ...storedCashtabWallet,
        paths: storedCashtabWallet.paths,
        state: {
            ...storedCashtabWallet.state,
        },
    };
};