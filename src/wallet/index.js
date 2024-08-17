import { BN } from 'slp-mdm';
import appConfig from '../config/app'
import { NetWorkType, DerivationPath, NetWorkName, DUMP_ADDRESS } from '../utils/const'
import * as bip39 from 'bip39';
import * as Decred from 'decredjs-lib';
import { isValidMultiSendUserInput } from '../validation';

const SATOSHIS_PER_XEC = 1e8;
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
            'Result not an integer. Check input for valid DCR amount.',
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

export const createDecredWallet = async (mnemonicWords) => {
    // Initialize wallet with empty state
    const wallet = {
        state: {
            balanceSats: 0,
            Utxos: [],
            parsedTxHistory: [],
        },
    };
    var mnemonicObj
    //create Decred mnemonic
    if (mnemonicWords) {
        mnemonicObj = Decred.Mnemonic(mnemonicWords)
    } else {
        mnemonicObj = Decred.Mnemonic()
    }

    if (!mnemonicObj || !mnemonicObj.phrase) {
        throw new Error(
            `Error mnemonic: Create mnemonic failed`,
        );
    }

    // Set wallet mnemonic
    wallet.mnemonic = mnemonicObj.phrase;
    const fullDerivationPath = `m/44'/${DerivationPath()}'/0'/0/0`;
    // Derive a child key from the HD key using the defined path
    const child = mnemonicObj.toHDPrivateKey(getNetworkName()).derive(fullDerivationPath)
    const pathInfo = {
        address: child.publicKey.toAddress().toString(),
        privateKey: child.privateKey.toString(),
        publicKey: child.publicKey.toString(),
        wif: child.privateKey.toWIF(),
    }
    wallet.name = pathInfo.address.slice(0, 6);
    const pathMap = {};
    pathMap[DerivationPath()] = pathInfo
    wallet.paths = pathMap;
    return wallet;
}

export const getNetworkName = () => {
    switch (appConfig.network) {
        case NetWorkType.Testnet:
            return NetWorkName.TestnetName;
        default:
            return NetWorkName.MainnetName;
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

export const getWalletState = wallet => {
    if (!wallet || !wallet.state) {
        return {
            balanceSats: 0,
            Utxos: [],
            parsedTxHistory: [],
        };
    }

    return wallet.state;
};

export const sumOneToManyDcr = destinationAddressAndValueArray => {
    return destinationAddressAndValueArray.reduce((prev, curr) => {
        return parseFloat(prev) + parseFloat(curr.split(',')[1]);
    }, 0);
};

export const getMaxSendAmountSatoshis = (
    wallet
) => {
    // xecUtxos are all spendable nonSlpUtxos in the wallet
    const dcrInputs = wallet.state.Utxos
    // Get total send qty of all non-token
    const totalSatsInWallet = dcrInputs.reduce(
        (previousBalance, utxo) => previousBalance + utxo.atoms,
        0,
    );
    const fee = EstimateFee(wallet, totalSatsInWallet)
    if (typeof fee !== 'number' || fee >= totalSatsInWallet) {
        throw new Error(
            'Calculate fee failed',
        );
    }
    //broadcast to decred network
    // The max send amount is totalSatsInWallet less txFeeInSatoshis
    const maxSendAmountSatoshis = totalSatsInWallet - fee;
    return {
        maxAmount: maxSendAmountSatoshis,
        fee: fee
    };
};

export const EstimateFee = (wallet, amount) => {
    const dcrInputs = wallet.state.Utxos
    const wif = wallet.paths[DerivationPath()].wif
    var privateKey = new Decred.PrivateKey(wif)
    var address = privateKey.toAddress()
    var tempTx = new Decred.Transaction()
        .from(dcrInputs)
        .to(getDumpAddress(), amount)
        .change(address.toString())
    return tempTx.getFee()
}

export const SendToMutilAddress = (wallet, addresses) => {
    const dcrInputs = wallet.state.Utxos
    const wif = wallet.paths[DerivationPath()].wif
    var privateKey = new Decred.PrivateKey(wif)
    var changeAddress = privateKey.toAddress()
    var totalAmount = 0
    addresses.forEach(addrData => {
        totalAmount += addrData.atoms
    })
    var resultTx = new Decred.Transaction()
        .from(dcrInputs)
        .to(addresses)
        .change(changeAddress.toString())
        .sign(privateKey)
    var fee = resultTx.getFee()
    const totalSatsInWallet = dcrInputs.reduce(
        (previousBalance, utxo) => previousBalance + utxo.atoms,
        0,
    );
    if (fee + totalAmount > totalSatsInWallet) {
        throw new Error(
            'Invalid amount and fee',
        );
    }
    const hexSerialize = resultTx.serialize()
    const txJson = resultTx.toJSON()
    return {
        hex: hexSerialize,
        tx: txJson
    }
}

/**
 * Get desired target outputs from validated user input for eCash multi-send tx in Cashtab
 * @param {string} userMultisendInput formData.address from Send.js screen, validated for multi-send
 * @throws {error} on invalid input
 * @returns {array} targetOutputs for the sendXec function
 */
export const getMultisendTargetOutputs = userMultisendInput => {
    if (isValidMultiSendUserInput(userMultisendInput) !== true) {
        throw new Error('Invalid input for Decred multisend tx');
    }
    // User input is validated as a string of
    // address, value\naddress, value\naddress, value\n
    const addressValueArray = userMultisendInput.split('\n');

    const targetOutputs = [];
    for (let addressValueCsvPair of addressValueArray) {
        const addressValueLineArray = addressValueCsvPair.split(',');
        const valueXec = parseFloat(addressValueLineArray[1].trim());
        // targetOutputs expects satoshis at value key
        const valueSats = toSatoshis(valueXec);
        targetOutputs.push({
            address: addressValueLineArray[0].trim(),
            atoms: valueSats,
        });
    }
    return targetOutputs;
};

export const SendAmount = (wallet, amount, address) => {
    const dcrInputs = wallet.state.Utxos
    const wif = wallet.paths[DerivationPath()].wif
    var privateKey = new Decred.PrivateKey(wif)
    var changeAddress = privateKey.toAddress()
    var resultTx = new Decred.Transaction()
        .from(dcrInputs)
        .to(address, amount)
        .change(changeAddress.toString())
        .sign(privateKey)
    var fee = resultTx.getFee()
    const totalSatsInWallet = dcrInputs.reduce(
        (previousBalance, utxo) => previousBalance + utxo.atoms,
        0,
    );
    if (fee + amount > totalSatsInWallet) {
        throw new Error(
            'Invalid amount and fee',
        );
    }
    //broadcast to network
    const hexSerialize = resultTx.serialize()
    const txJson = resultTx.toJSON()
    return {
        hex: hexSerialize,
        tx: txJson
    }
}

export const getDumpAddress = () => {
    switch (appConfig.network) {
        case NetWorkType.Testnet:
            return DUMP_ADDRESS.TestnetAddr;
        default:
            return DUMP_ADDRESS.MainnetAddr;
    }
}

export const parseTxData = (wallet, tx) => {
    var result = {
        txid: tx.txid,
        confirmations: tx.confirmations,
        time: tx.time
    }
    if (!wallet) {
        return result
    }
    const walletState = getWalletState(wallet);
    const { parsedTxHistory } = walletState;
    const txHistories = cleanParsedTxHistory(parsedTxHistory)
    var walletAddresses = []
    const pathKeys = Object.keys(wallet.paths)
    for (let i = 0; i < pathKeys.length; i++) {
        const path = pathKeys[i]
        const pathInfo = wallet.paths[path]
        walletAddresses.push(pathInfo.address)
    }
    let isSend = false
    tx.vin.forEach(indata => {
        txHistories.forEach(txHistory => {
            //if vin txid is transaction of wallet, is send transaction
            if (indata.txid == txHistory.txid) {
                //check txHistory with current vin data
                const isOutputOfWallet = isOutputOfWalletAddress(indata.vout, txHistory.vout, walletAddresses)
                if (isOutputOfWallet) {
                    isSend = true
                    return
                }
            }
        })
    })
    //calculate tx fee
    let vinTotal = 0
    let voutTotal = 0
    let vinData = []
    let voutData = []
    tx.vin.forEach(indata => {
        const inValue = toSatoshis(indata.amountin)
        vinTotal += inValue
        vinData.push({
            txid: indata.txid,
            value: inValue,
            vout: indata.vout
        })
    })
    //define change amount
    let receiveAmount = 0
    tx.vout.forEach(out => {
        const outValue = toSatoshis(out.value)
        voutTotal += outValue
        const address = out.scriptPubKey.addresses[0]
        voutData.push({
            address: address,
            value: outValue,
            n: out.n
        })
        if (existWalletAddressInVouts(out, walletAddresses)) {
            receiveAmount += outValue
        }
    })
    const fee = vinTotal - voutTotal
    //calculate amount of transaction
    let txAmount = 0
    //if is send tx
    if (isSend) {
        txAmount = vinTotal - fee - receiveAmount
    } else {
        txAmount = receiveAmount
    }
    result.isSend = isSend
    result.amount = txAmount
    result.fee = fee
    result.vin = vinData
    result.vout = voutData
    return result
}

const isOutputOfWalletAddress = (index, txVouts, walletAddresses) => {
    if (index >= txVouts.length) {
        return false
    }
    let isOutputOfWallet = false
    const vout = txVouts[index]
    vout.scriptPubKey.addresses.forEach(addr => {
        //check addr in walletAddresses
        walletAddresses.forEach(wAddr => {
            if (addr == wAddr) {
                isOutputOfWallet = true
                return
            }
        })
    })
    return isOutputOfWallet
}

const existWalletAddressInVouts = (out, walletAddresses) => {
    const addresses = out.scriptPubKey.addresses
    if (!addresses || addresses.length < 1) {
        return false
    }
    let exist = false
    addresses.forEach(addr => {
        walletAddresses.forEach(wAddr => {
            if (wAddr == addr) {
                exist = true
                return
            }
        })
    })
    return exist
}

export const cleanParsedTxHistory = (parsedTxHistory) => {
    if (!parsedTxHistory || parsedTxHistory.length < 1) {
        return parsedTxHistory
    }
    var result = []
    parsedTxHistory.forEach(txHistory => {
        const find = result.find(({txid}) => txid == txHistory.txid)
        if (!find) {
            result.push(txHistory)
        }
    })
    return result
}