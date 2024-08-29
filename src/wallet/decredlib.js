import HDPrivateKey from "decredjs-lib/lib/hdprivatekey";
import * as Decred from 'decredjs-lib';
import { DerivationPath } from "../utils/const";
import * as bip39 from 'bip39';
import { getNetworkName } from ".";

export const toHDPrivateKey = (network, buf) => {
    return HDPrivateKey.fromSeed(buf, network);
};

export const getWalletFromDerivationPath = (mnemonicWords, seedType) => {
    const fullDerivationPath = `m/44'/${DerivationPath()}'/0'/0/0`;
    if (seedType == 12 || seedType == 24) {
        return getBip39SeedTypeWallet(mnemonicWords, fullDerivationPath)
    }
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
    // Derive a child key from the HD key using the defined path
    return mnemonicObj.toHDPrivateKey(getNetworkName()).derive(fullDerivationPath)
}

export const getBip39SeedTypeWallet = (mnemonicWords, derivationPath) => {
    const seed = bip39.mnemonicToSeedSync(mnemonicWords);
    const buf = Buffer.from(seed, "hex")
    return toHDPrivateKey(getNetworkName(), buf).derive(derivationPath);
}