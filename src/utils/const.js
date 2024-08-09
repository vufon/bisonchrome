import appConfig from '../config/app';


export const NetWorkType = {
    Mainnet: 'mainnet',
    Testnet: 'testnet',
    Simnet: 'simnet'
};

export const NetWorkPostFix = {
    MainPostFix: '',
    TestPostFix: '-test',
    SimPostFix: '-simnet',
};

export const DerivationPath = () => {
    switch (appConfig.network) {
        case NetWorkType.Mainnet:
            return appConfig.derivationPath;
        default:
            return appConfig.testDerivationPath;
    }
}
