import { BN } from 'slp-mdm';
import CoinKey from 'coinkey';
import CoinInfo from 'coininfo';
import HDKey from 'hdkey';
import appConfig from '../config/app'
import { NetWorkType, NetWorkPostFix, DerivationPath, NetworkInfo } from '../utils/const'
import * as bip39 from 'bip39';
import { payments } from 'bitcoinjs-lib';
import { Buffer } from 'safe-buffer';
import fromSeed from 'bip32'
import typeforce from 'typeforce';
import types from '../utils/types';
import createHmac from 'create-hmac';
import { BigInteger } from 'bigi';

const SATOSHIS_PER_XEC = 100;
const STRINGIFIED_INTEGER_REGEX = /^[0-9]+$/;
export const STRINGIFIED_DECIMALIZED_REGEX = /^\d*\.?\d*$/;
/**
 * Convert user input send amount to satoshis
 * @param {string | number} sendAmountFiat User input amount of fiat currency to send.
 * Input from an amount field is of type number. If we extend fiat send support to bip21 or
 * webapp txs, we should also handle string inputs
 * @param {number} fiatPrice Price of XEC in units of selectedCurrency / XEC
 * @return {Integer} satoshis value equivalent to this sendAmountFiat at exchange rate fiatPrice
 */
export const fiatToSatoshis = (sendAmountFiat, fiatPrice) => {
    return Math.floor((Number(sendAmountFiat) / fiatPrice) * SATOSHIS_PER_XEC);
};

/**
 * Convert an amount in XEC to satoshis
 * @param {Number} xecAmount a number with no more than 2 decimal places
 * @returns {Integer}
 */
export const toSatoshis = xecAmount => {
    const satoshis = new BN(xecAmount).times(SATOSHIS_PER_XEC).toNumber();
    if (!Number.isInteger(satoshis)) {
        throw new Error(
            'Result not an integer. Check input for valid XEC amount.',
        );
    }
    return satoshis;
};

/**
 * Convert an amount in satoshis to XEC
 * @param {Integer} satoshis
 * @returns {Number}
 */
export const toDCR = satoshis => {
    if (!Number.isInteger(satoshis)) {
        throw new Error('Input param satoshis must be an integer');
    }
    return new BN(satoshis).div(SATOSHIS_PER_XEC).toNumber();
};

export const createDecredWallet = async (mnemonic, additionalPaths = []) => {
    // Initialize wallet with empty state
    const wallet = {
        state: {
            balanceSats: 0,
            Utxos: [],
            parsedTxHistory: [],
        },
    };

    //test with seed
    console.log(BIP44(mnemonic))

    // Set wallet mnemonic
    wallet.mnemonic = mnemonic;
    // Convert the mnemonic to a seed
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    // Create an HD wallet key from the seed
    const hdKey = HDKey.fromMasterSeed(Buffer.from(seed, "hex"));
    const child = hdKey.derive(`m/44'/${DerivationPath()}'/0'/0/0`);
    const pathInfo = getPathInfo(hdKey, DerivationPath());
    wallet.name = pathInfo.address.slice(0, 6);
    const pathMap = {};
    pathMap[DerivationPath()] = pathInfo
    wallet.paths = pathMap;
    return wallet;
}

export const fromSeed = (seed) => {
    const network = getNetwork()

}

export const fromSeedHex = (hex, network) => {

}

const MASTER_SECRET = Buffer.from('Bitcoin seed', 'utf8')

export const fromSeedBuffer = (seed, network) => {
    typeforce(types.tuple(types.Buffer, types.maybe(types.Network)), arguments)
    if (seed.length < 16) return
    if (seed.length > 64) return

    var I = createHmac('sha512', MASTER_SECRET).update(seed).digest()
    var IL = I.slice(0, 32)
    var IR = I.slice(32)

    // In case IL is 0 or >= n, the master key is invalid
    // This is handled by the ECPair constructor
    var pIL = BigInteger .fromBuffer(IL)
    var keyPair = new ECPair(pIL, null, {
        network: network
    })

    return HDNode(keyPair, IR)
}

export const HDNode = (keyPair, chainCode) => {
    typeforce(types.tuple('ECPair', types.Buffer256bit), arguments)
    if (!keyPair.compressed) return
    return {
        keyPair: keyPair,
        chainCode: chainCode,
        depth: 0,
        index: 0,
        parentFingerprint: 0x00000000,
        derivationCache: {},
    }
}

export const getNetwork = () => {
    switch (appConfig.network) {
        case NetWorkType.Testnet:
            return NetworkInfo.decredTest;
        case NetWorkType.Simnet:
            return NetworkInfo.decredSim;
        default:
            return NetworkInfo.decred;
    }
}

const getPathInfo = (hdKey, abbreviatedDerivationPath) => {
    const fullDerivationPath = `m/44'/${abbreviatedDerivationPath}'/0'/0/0`;
    // Derive a child key from the HD key using the defined path
    const child = hdKey.derive(fullDerivationPath);
    const coinKey = new CoinKey(child.privateKey, CoinInfo("dcr" + getCoinTypePostfix()).versions)
    return {
        address: coinKey.publicAddress,
        wif: coinKey.privateWif,
    };
};

const getCoinTypePostfix = () => {
    switch (appConfig.network) {
        case NetWorkType.Testnet:
            return NetWorkPostFix.TestPostFix;
        case NetWorkType.Simnet:
            return NetWorkPostFix.SimPostFix;
        default:
            return NetWorkPostFix.MainPostFix;
    }
}

export const getWalletsForNewActiveWallet = (walletToActivate, wallets) => {
    // Clone wallets so we do not mutate the app's wallets array
    const currentWallets = [...wallets];
    // Find this wallet in wallets
    const indexOfWalletToActivate = currentWallets.findIndex(
        wallet => wallet.mnemonic === walletToActivate.mnemonic,
    );

    if (indexOfWalletToActivate === -1) {
        // should never happen
        throw new Error(
            `Error activating "${walletToActivate.name}": Could not find wallet in wallets`,
        );
    }

    // Remove walletToActivate from currentWallets
    currentWallets.splice(indexOfWalletToActivate, 1);

    // Sort inactive wallets alphabetically by name
    currentWallets.sort((a, b) => a.name.localeCompare(b.name));

    // Put walletToActivate at 0-index
    return [walletToActivate, ...currentWallets];
};
