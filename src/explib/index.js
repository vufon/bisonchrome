import appConfig from "../config/app";
import { httpGet } from "../http";
import { NetWorkName } from "../utils/const";

export const TESTNET_EXPLORER_API = 'https://testnet.dcrdata.org/api'
export const MAINET_EXPLORER_API = 'https://dcrdata.decred.org/api'

export const getWalletData = async (wallet) => {
    const walletData = {
        txList: [],
        utxos: [],
        balance: 0
    };
    const pathKeys = Object.keys(wallet.paths)
    for (let i = 0; i < pathKeys.length; i++) {
        const path = pathKeys[i]
        const pathInfo = wallet.paths[path]
        const pathData = await getPathedTxAndTxHistoryPromise(pathInfo.address, path)
        walletData.txList.push(...pathData.txList)
        walletData.utxos.push(...pathData.utxos)
        walletData.balance += pathData.balance
    }
    return walletData;
};

export const getPathedTxAndTxHistoryPromise = async (address, path) => {
    const addressTxs = await getAddressTxsRaw(address)
    let utxos = []
    const resData = {
        txList: addressTxs ? addressTxs : [],
        utxos: utxos,
        balance: 0
    }
    if (!addressTxs) {
        return resData
    }
    const inputs = []
    const outputTxs = []
    let balance = 0
    //define utxos, stxos
    addressTxs.forEach(txs => {
        const txid = txs.txid
        const confirmations = txs.confirmations
        if (txs.vout) {
            txs.vout.forEach(out => {
                const scriptPubkey = out.scriptPubKey
                if (scriptPubkey && scriptPubkey.addresses) {
                    scriptPubkey.addresses.forEach(addr => {
                        //if is input tx
                        if (addr == address) {
                            //insert to inputs array
                            const inputData = {
                                address: address,
                                path: path,
                                txid: txid,
                                vout: out.n,
                                scriptPubKey: scriptPubkey.hex,
                                amount: out.value,
                                satoshis: Math.round(out.value * 1e8),
                                confirmations: confirmations
                            }
                            inputs.push(inputData)
                        }
                    })
                }
            })
        }
        if (txs.vin) {
            txs.vin.forEach(vinElement => {
                outputTxs.push({
                    txid: vinElement.txid,
                    vout: vinElement.vout
                })
            })
        }
    })
    //handler utxos array
    inputs.forEach(input => {
        if (!checkIsOutputOfOtherTx(input, outputTxs)) {
            utxos.push(input)
        }
    })
    resData.utxos = utxos
    //calculate balance of address
    utxos.forEach(utxo => {
        balance += utxo.satoshis
    })
    resData.balance = balance
    return resData
}

export const checkIsOutputOfOtherTx = (input, outputTxs) => {
    let isOutput = false
    outputTxs.forEach(out => {
        if (input.txid == out.txid && input.vout == out.vout) {
            isOutput = true
            return
        }
    })
    return isOutput
}

export const getAddressTxsRaw = async (address) => {
    const responseData = await httpGet(getAPIURL() + '/address/' + address + '/count/100000/raw')
    if (responseData.error) {
        return null
    }
    return responseData.data
}

export const getAddressBalance = (address) => {
    const resData = httpGet(getAPIURL() + '/address/' + address + '/totals')
    const balance = resData.dcr_unspent ? resData.dcr_unspent : 0
    return balance
}

export const getAPIURL = () => {
    return appConfig.network == NetWorkName.MainnetName ? MAINET_EXPLORER_API : TESTNET_EXPLORER_API
}