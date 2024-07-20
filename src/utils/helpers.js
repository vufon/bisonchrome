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