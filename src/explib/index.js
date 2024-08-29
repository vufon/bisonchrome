import appConfig from "../config/app";
import { httpGet } from "../http";
import { NetWorkName, NetWorkType } from "../utils/const";

export const TESTNET_EXPLORER_API = 'https://testnet.blockcare.pro/api'
export const MAINET_EXPLORER_API = 'https://blockcare.pro/api'
export const TESTNET_BROADCAST_API = 'https://testnet.blockcare.pro/api'
export const MAINET_BROADCAST_API = 'https://blockcare.pro/api'
export const TESTNET_EXPLORER_URL = 'https://testnet.dcrdata.org'
export const MAINET_EXPLORER_URL = 'https://dcrdata.decred.org'

export const getWalletData = async (wallet) => {
    const walletData = {
        txList: [],
        utxos: [],
        balance: 0
    };
    //if wallet
    const pathKeys = Object.keys(wallet.paths)
    for (let i = 0; i < pathKeys.length; i++) {
        const path = pathKeys[i]
        const pathInfo = wallet.paths[path]
        const pathData = await getPathedTxAndTxHistoryPromise(pathInfo.address)
        walletData.txList.push(...pathData.txList)
        walletData.utxos.push(...pathData.utxos)
        walletData.balance += pathData.balance
    }
    return walletData;
};

//get tx list with multi-address
export const getAddressesTxHistories = async (isSync, addresses, activeWallet, wallets, updateDecredState) => {
    const syncSeparate = []
    let addrArray = []
    const addressObjsMap = new Map()
    const eachSyncAddr = 200
    let count = 0
    //get address list string
    addresses.forEach(addr => {
        if (count == eachSyncAddr) {
            syncSeparate.push(addrArray)
            count = 0
            addrArray = []
        } else {
            addrArray.push(addr.address)
            count++
        }
        addressObjsMap.set(addr.address, addr)
    })
    if (count > 0) {
        syncSeparate.push(addrArray)
    }
    const addressesTxsMap = {}
    const maxPercent = isSync ? 50 : 90
    for (let i = 0; i < syncSeparate.length; i++) {
        const addressArray = syncSeparate[i]
        const tmpMap = await getAddressesTxsRaw(addressArray.join(','))
        if (tmpMap) {
            const addrKeys = Object.keys(tmpMap)
            addrKeys.forEach(addrKey => {
                addressesTxsMap[addrKey] = tmpMap[addrKey]
            })
        }

        const addPercent = Math.round(maxPercent * (i + 1) / syncSeparate.length)
        activeWallet.syncPercent += addPercent
        if (activeWallet.syncPercent > 90) {
            activeWallet.syncPercent = 90
        }
        await updateDecredState('wallets', [
            activeWallet,
            ...wallets.slice(1),
        ]);
    }
    const addrKeys = Object.keys(addressesTxsMap)
    let utxos = []
    const resData = {
        activeAddresses: [],
        txList: [],
        utxos: utxos,
        balance: 0
    }
    for (let keyIndex = 0; keyIndex < addrKeys.length; keyIndex++) {
        const addrKey = addrKeys[keyIndex]
        const txsAddressObj = addressesTxsMap[addrKey]
        if (txsAddressObj && txsAddressObj.length > 0 && addressObjsMap.has(addrKey)) {
            const inputs = []
            const outputTxs = []
            pushTxToList(txsAddressObj, resData.txList)
            resData.activeAddresses.push(addressObjsMap.get(addrKey))
            //define utxos, stxos
            txsAddressObj.forEach(txs => {
                const txid = txs.txid
                const confirmations = txs.confirmations
                if (txs.vout) {
                    txs.vout.forEach(out => {
                        const scriptPubkey = out.scriptPubKey
                        if (scriptPubkey && scriptPubkey.addresses) {
                            scriptPubkey.addresses.forEach(addr => {
                                //if is input tx
                                if (addr == addrKey) {
                                    //insert to inputs array
                                    const inputData = {
                                        address: addrKey,
                                        txId: txid,
                                        outputIndex: out.n,
                                        script: scriptPubkey.hex,
                                        total: out.value,
                                        atoms: Math.round(out.value * 1e8),
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
        }
    }
    resData.utxos = utxos
    let balance = 0
    //calculate balance of address
    utxos.forEach(utxo => {
        balance += utxo.atoms
    })
    resData.balance = balance
    if (resData.txList && resData.txList.length > 1) {
        resData.txList.sort((a, b) => (a.time > b.time) ? -1 : ((a.time < b.time) ? 1 : 0))
    }
    return resData
}

export const pushTxToList = async (txList, targets) => {
    txList.forEach(tx => {
        let exist = false
        let replace = false
        let replaceIndex = -1
        for (let i = 0; i < targets.length; i++) {
            const targetTx = targets[i]
            if (targetTx.txid == tx.txid) {
                exist = true
                if (tx.time > 0) {
                    replace = true
                    replaceIndex = i
                }
                break
            }
        }
        if (!exist) {
            targets.push(tx)
        } else if (replace && replaceIndex >= 0) {
            targets[replaceIndex] = tx
        }
    })
}


export const getPathedTxAndTxHistoryPromise = async (address) => {
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
                                txId: txid,
                                outputIndex: out.n,
                                script: scriptPubkey.hex,
                                total: out.value,
                                atoms: Math.round(out.value * 1e8),
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
        balance += utxo.atoms
    })
    resData.balance = balance
    return resData
}

export const checkIsOutputOfOtherTx = (input, outputTxs) => {
    let isOutput = false
    outputTxs.forEach(out => {
        if (input.txId == out.txid && input.outputIndex == out.vout) {
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

export const getAddressesTxsRaw = async (addresses) => {
    const responseData = await httpGet(getAPIURL() + '/address/addressesTxs/' + addresses)
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
    return appConfig.network == NetWorkType.Mainnet ? MAINET_EXPLORER_API : TESTNET_EXPLORER_API
}

export const getBroadcastAPIURL = () => {
    return appConfig.network == NetWorkType.Mainnet ? MAINET_BROADCAST_API : TESTNET_BROADCAST_API
}

export const getExplorerURL = () => {
    return appConfig.network == NetWorkType.Mainnet ? MAINET_EXPLORER_URL : TESTNET_EXPLORER_URL
}

export const broadcastTx = async (txHex, depth) => {
    const resData = await httpGet(getBroadcastAPIURL() + '/broadcast?hex=' + txHex)
    if (resData.error && depth == 5) {
        throw new Error('Broadcast transaction failed')
    }
    if (resData.error) {
        return broadcastTx(txHex, depth + 1)
    }
    return resData
}