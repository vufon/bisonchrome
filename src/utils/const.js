import appConfig from '../config/app';

export const NetWorkType = {
    Mainnet: 'mainnet',
    Testnet: 'testnet',
};

export const DUMP_ADDRESS = {
    MainnetAddr: 'DsdWUgon6bvErENczvkifDqXqxUVRYLRMsM',
    TestnetAddr: 'TcZzyn89mrSHUv5bxfkTan8VvQCxwkkSpFK',
};

export const NetWorkName = {
    MainnetName: 'dcrdlivenet',
    TestnetName: 'dcrdtestnet',
};

export const NetworkInfo = {
    decred: {
        messagePrefix: '\x17Decred Signed Message:\n',
        bip32: {
            public: 0x02fda926,
            private: 0x02fda4e8
        },
        pubKeyHash: 0x073f,
        scriptHash: 0x071a,
        wif: 0x22de,
    },
    decredTest: {
        messagePrefix: '\x17Decred Signed Message:\n',
        bip32: {
            public: 0x043587d1,
            private: 0x04358397
        },
        pubKeyHash: 0x0f21,
        scriptHash: 0x0efc,
        wif: 0x230e,
    },
    decredSim: {
        messagePrefix: '\x17Decred Signed Message:\n',
        bip32: {
            public: 0x0420bd3d,
            private: 0x0420b903
        },
        pubKeyHash: 0x0e91,
        scriptHash: 0x0e6c,
        wif: 0x2307,
    }
}

export const DerivationPath = () => {
    switch (appConfig.network) {
        case NetWorkType.Mainnet:
            return appConfig.derivationPath;
        default:
            return appConfig.testDerivationPath;
    }
}
