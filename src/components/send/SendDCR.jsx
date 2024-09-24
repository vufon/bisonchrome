import styled from 'styled-components';
import Switch from '../common/Switch';
import React, { useState } from 'react';
import appConfig from '../../config/app';
import { formatBalance, formatFiatBalance } from '../../utils/formatting';
import { ConvertAmount, TxLink } from '../common/Atoms';
import { getUserLocale } from '../../utils/helpers';
import PrimaryButton from '../common/Buttons';
import {
  InputWithScanner,
  SendXecInput,
  TextArea,
} from '../common/Inputs';
import Modal from '../common/Modal';
import { isValidMultiSendUserInput, isValidXecSendAmount, parseAddressInput, shouldSendXecBeDisabled } from '../../validation';
import { WalletContext } from '../../wallet/context';
import { EstimateFee, fiatToSatoshis, getMaxSendAmountSatoshis, getMultisendTargetOutputs, getNetworkName, getWalletState, SendAmount, SendToMutilAddress, sumOneToManyDcr, syncDecredWalletData, toDCR, toSatoshis } from '../../wallet';
import { supportedFiatCurrencies } from '../../config/cashtabSettings';
import { broadcastTx, getExplorerURL } from '../../explib';
import { toast } from 'react-toastify';
import { HomeBackupArea } from '../Home';
import { WalletButtonRow } from '../wallets/styles';
import { NetWorkType } from '../../utils/const';

const SendXecForm = styled.div`
    margin: 12px 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;
export const CashReceivedNotificationIcon = () => (
  <img height={'24px'} width={'24px'} src={appConfig.logo} />
);
const SendXecRow = styled.div``;
const SwitchAndLabel = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
`;
const SwitchLabel = styled.div`
    color: ${props => props.theme.contrast};
`;
const SwitchContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    color: ${props => props.theme.forms.text};
    white-space: nowrap;
    margin: 12px 0;
`;

// const SentLink = styled.a`
//     color: ${props => props.theme.walletBackground};
//     text-decoration: none;
// `;

const AliasAddressPreviewLabel = styled.div`
    text-align: center;
    color: ${props => props.theme.forms.text};
    padding-left: 1px;
    white-space: nowrap;
`;

const AmountPreviewCtn = styled.div`
    margin: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;
// const ParsedOpReturnRawRow = styled.div`
//     display: flex;
//     flex-direction: column;
//     word-break: break-word;
// `;
// const ParsedOpReturnRawLabel = styled.div`
//     color: ${props => props.theme.contrast};
//     text-align: left;
//     width: 100%;
// `;
// const ParsedOpReturnRaw = styled.div`
//     background-color: #fff2f0;
//     border-radius: 12px;
//     color: ${props => props.theme.eCashBlue};
//     padding: 12px;
//     text-align: left;
// `;

const LocaleFormattedValue = styled.div`
    color: ${props => props.theme.contrast};
    font-weight: bold;
    font-size: 1.17em;
    margin-bottom: 0;
`;

const SendToOneHolder = styled.div``;
const SendToManyHolder = styled.div``;
const SendToOneInputForm = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;
const InputAndAliasPreviewHolder = styled.div`
    displaly: flex;
    flex-direction: column;
`;

const SentLink = styled.a`
    color: ${props => props.theme.walletBackground};
    text-decoration: none;
`;

const InputModesHolder = styled.div`
    min-height: 9rem;
    ${SendToOneHolder} {
        overflow: hidden;
        transition: ${props =>
    props.open
      ? 'max-height 200ms ease-in, opacity 200ms ease-out'
      : 'max-height 200ms cubic-bezier(0, 1, 0, 1), opacity 200ms ease-in'};
        max-height: ${props => (props.open ? '0rem' : '12rem')};
        opacity: ${props => (props.open ? 0 : 1)};
    }
    ${SendToManyHolder} {
        overflow: hidden;
        transition: ${props =>
    props.open
      ? 'max-height 200ms ease-in, transform 200ms ease-out, opacity 200ms ease-in'
      : 'max-height 200ms cubic-bezier(0, 1, 0, 1), transform 200ms ease-out'};
        max-height: ${props => (props.open ? '12rem' : '0rem')};
        transform: ${props =>
    props.open ? 'translateY(0%)' : 'translateY(100%)'};
        opacity: ${props => (props.open ? 1 : 0)};
    }
`;

const SendDCR = ({ addressInput = '' }) => {
  const emptyFormData = {
    amount: '',
    address: '',
    multiAddressInput: '',
    airdropTokenId: '',
    cashtabMsg: '',
    opReturnRaw: '',
  };
  const ContextValue = React.useContext(WalletContext);
  const {
    fiatPrice,
    apiError,
    decredState,
    updateDecredState,
  } = ContextValue;

  const { settings, wallets } = decredState;
  const wallet = wallets.length > 0 ? wallets[0] : false;
  const walletState = getWalletState(wallet);
  const { balanceSats } = walletState;
  const tempFormData = emptyFormData
  tempFormData.address = addressInput
  const [isOneToManyXECSend, setIsOneToManyXECSend] = useState(false);
  const [formData, setFormData] = useState(tempFormData);
  const [sendAddressError, setSendAddressError] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(appConfig.ticker);
  const [sendAmountError, setSendAmountError] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [feeEstimate, setFeeEstimate] = useState(undefined);
  const [parsedAddressInput, setParsedAddressInput] = useState(
    parseAddressInput(''),
  );
  // const [opReturnRawError, setOpReturnRawError] = useState(false);
  // const [parsedOpReturnRaw, setParsedOpReturnRaw] = useState({
  //   protocol: '',
  //   data: '',
  // });
  const handleAddressChange = async e => {
    const { value, name } = e.target;
    const parsedAddressInput = parseAddressInput(
      value,
      balanceSats,
      userLocale,
    );

    // Set in state as various param outputs determine app rendering
    // For example, a valid amount param should disable user amount input
    setParsedAddressInput(parsedAddressInput);

    const address = parsedAddressInput.address.value;
    let renderedSendToError = parsedAddressInput.address.error;
    if (
      'queryString' in parsedAddressInput &&
      typeof parsedAddressInput.queryString.error === 'string'
    ) {
      // If you have a bad queryString, this should be the rendered error
      renderedSendToError = parsedAddressInput.queryString.error;
    }

    setSendAddressError(renderedSendToError);

    // Set amount if it's in the query string
    if ('amount' in parsedAddressInput) {
      // Set currency to non-fiat
      setSelectedCurrency(appConfig.ticker);

      // Use this object to mimic user input and get validation for the value
      let amountObj = {
        target: {
          name: 'amount',
          value: parsedAddressInput.amount.value,
        },
      };
      handleAmountChange(amountObj);
    }

    // Set address field to user input
    setFormData(p => ({
      ...p,
      [name]: value,
    }));
  };
  const handleSelectedCurrencyChange = e => {
    setSelectedCurrency(e.target.value);
    // Clear input field to prevent accidentally sending 1 XEC instead of 1 USD
    setFormData(p => ({
      ...p,
      amount: '',
    }));
  };

  const isValidAmount = async (value) => {
    // Validate user input send amount
    const isValidAmountOrErrorMsg = await isValidXecSendAmount(
      value,
      balanceSats,
      userLocale,
      selectedCurrency,
      fiatPrice,
    );

    setSendAmountError(
      isValidAmountOrErrorMsg !== true ? isValidAmountOrErrorMsg : false,
    );
    return isValidAmountOrErrorMsg
  }

  const postHandlerAmountChange = e => {
    const { value, name } = e.target;
    setFormData(p => ({
      ...p,
      [name]: value,
    }));
  }

  const onMax = () => {
    // Clear amt error
    setSendAmountError(false);

    // Set currency to XEC
    setSelectedCurrency(appConfig.ticker);
    // Build a tx sending all non-token utxos
    // Determine the amount being sent (outputs less fee)
    let maxSendSatoshis;
    try {
      // An error will be thrown if the wallet has insufficient funds to send more than dust
      const maxSend = getMaxSendAmountSatoshis(wallet, settings);
      maxSendSatoshis = maxSend.maxAmount
      setFeeEstimate(maxSend.fee)
    } catch (err) {
      // Set to zero. In this case, 0 is the max amount we can send, and we know
      // this will trigger the expected dust validation error
      maxSendSatoshis = 0;
    }

    // Convert to XEC to set in form
    const maxSendXec = toDCR(maxSendSatoshis);
    isValidAmount(maxSendXec)
    let maxSendStr = maxSendXec.toString()
    if (maxSendStr.includes(',')) {
      maxSendStr = maxSendStr.replace(',', '.')
    }
    // Update value in the send field
    // Note, if we are updating it to 0, we will get a 'dust' error
    postHandlerAmountChange({
      target: {
        name: 'amount',
        value: parseFloat(maxSendStr),
      },
    });
  }

  const handleAmountChange = e => {
    const { value } = e.target;
    const validAmount = isValidAmount(value)
    if (validAmount === true) {
      //estimate fee
      setFeeEstimate(EstimateFee(wallet, toSatoshis(value), settings))
    }
    postHandlerAmountChange(e)
  };

  const userLocale = getUserLocale(navigator);
  let fiatPriceString = '';
  let multiSendTotal =
    typeof formData.multiAddressInput === 'string'
      ? sumOneToManyDcr(formData.multiAddressInput.split('\n'))
      : 0;
  if (isNaN(multiSendTotal)) {
    multiSendTotal = 0;
  }
  if (fiatPrice !== null && !isNaN(formData.amount)) {
    if (selectedCurrency === appConfig.ticker) {
      // insert symbol and currency before/after the locale formatted fiat balance
      fiatPriceString = isOneToManyXECSend
        ? `${settings
          ? `${supportedFiatCurrencies[settings.fiatCurrency]
            .symbol
          } `
          : '$ '
        } ${(fiatPrice * multiSendTotal).toLocaleString(userLocale, {
          minimumFractionDigits: appConfig.cashDecimals,
          maximumFractionDigits: appConfig.cashDecimals,
        }).replace(',', '.')} ${settings && settings.fiatCurrency
          ? settings.fiatCurrency.toUpperCase()
          : 'USD'
        }`
        : `${settings
          ? `${supportedFiatCurrencies[settings.fiatCurrency]
            .symbol
          } `
          : '$ '
        } ${(fiatPrice * formData.amount).toLocaleString(userLocale, {
          minimumFractionDigits: appConfig.cashDecimals,
          maximumFractionDigits: appConfig.cashDecimals,
        }).replace(',', '.')} ${settings && settings.fiatCurrency
          ? settings.fiatCurrency.toUpperCase()
          : 'USD'
        }`;
    } else {
      fiatPriceString = `${formData.amount !== 0
        ? formatFiatBalance(
          toDCR(fiatToSatoshis(formData.amount, fiatPrice)),
          userLocale,
        )
        : formatFiatBalance(0, userLocale)
        } ${appConfig.ticker}`;
    }
  }
  const [multiSendAddressError, setMultiSendAddressError] = useState(false);

  const priceApiError = fiatPrice === null && selectedCurrency !== 'DCR';
  const disableSendButton = shouldSendXecBeDisabled(
    formData,
    balanceSats,
    apiError,
    sendAmountError,
    sendAddressError,
    multiSendAddressError,
    priceApiError,
    isOneToManyXECSend,
  );

  const handleMultiAddressChange = async e => {
    const { value, name } = e.target;
    let errorOrIsValid = await isValidMultiSendUserInput(
      value,
      balanceSats,
      userLocale,
    );
    // If you get an error msg, set it. If validation is good, clear error msg.
    setMultiSendAddressError(
      errorOrIsValid !== true ? errorOrIsValid : false,
    );

    // Set address field to user input
    setFormData(p => ({
      ...p,
      [name]: value,
    }));
  };

  const checkForConfirmationBeforeSendXec = () => {
    if (settings.sendModal) {
      setIsModalVisible(settings.sendModal);
    } else {
      // if the user does not have the send confirmation enabled in settings then send directly
      send();
    }
  };

  const handleOk = () => {
    setIsModalVisible(false);
    send();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const clearInputForms = () => {
    setFormData(emptyFormData);
    setParsedAddressInput(parseAddressInput(''));
    // Reset to DCR
    // Note, this ensures we never are in fiat send mode for multi-send
    setSelectedCurrency(appConfig.ticker);
  };

  const getExAddress = () => {
    if (appConfig.network == NetWorkType.Testnet) {
      return ['TsnvGDpc7WnaQGHWjomwpTN7asYfQJxNh1v', 'Tsm7NUrrRonoWUYbMJKMVjxfXYgrfNKEwfh']
    }
    return ['DscwTg8tkdwPsxEVbYqGqXfFtMMfUzBVuvy', 'DsbwUQsadZaKYknuGCBxTeVmnfmm7UAoMAH']
  }

  const addrExample = getExAddress()

  async function send() {
    setFormData({
      ...formData,
    });

    //check valid
    if (sendAddressError || sendAmountError) {
      return
    }
    let addresses = []
    if (isOneToManyXECSend) {
      // Handle DCR send to multiple addresses
      addresses = addresses.concat(
        getMultisendTargetOutputs(formData.multiAddressInput),
      );
    } else {
      const satoshisToSend =
        selectedCurrency === 'DCR'
          ? toSatoshis(formData.amount)
          : fiatToSatoshis(formData.amount, fiatPrice);
      addresses.push({
        address: formData.address,
        atoms: satoshisToSend,
      })
    }
    //send amount
    try {
      const txResult = SendToMutilAddress(wallet, addresses, settings)
      if (txResult.tx && txResult.tx.hash) {
        //broadcast tx to network
        const broadCastData = await broadcastTx(txResult.hex, 0)
        toast(
          <SentLink
            href={`${getExplorerURL()}/tx/` + broadCastData.data}
            target="_blank"
            rel="noopener noreferrer"
          >
            Decred sent
          </SentLink >,
          {
            icon: CashReceivedNotificationIcon,
          },
        );
        clearInputForms();
        await syncDecredWalletData(wallet, wallets, updateDecredState)
        wallet.syncPercent = 100
        updateDecredState('wallets', [
          wallet,
          ...wallets.slice(1),
        ]);
      }
    } catch (err) {
      toast.error(err)
    }
  }

  return (
    <>
      {isModalVisible && (
        <Modal
          title="Confirm Send"
          description={
            isOneToManyXECSend
              ? `Send
                ${multiSendTotal.toLocaleString(userLocale, {
                maximumFractionDigits: 2,
              })} 
                                DCR to multiple recipients?`
              : `Send ${formData.amount}${' '}
                  ${selectedCurrency} to ${parsedAddressInput.address.value}`
          }
          handleOk={handleOk}
          handleCancel={handleCancel}
          showCancelButton
        />
      )}
      <HomeBackupArea>
        <SwitchContainer>
          <Switch
            name="Toggle Multisend"
            on="Send to many"
            off="Send to one"
            width={150}
            right={115}
            checked={isOneToManyXECSend}
            handleToggle={() =>
              setIsOneToManyXECSend(!isOneToManyXECSend)
            }
          />
        </SwitchContainer>
        <InputModesHolder open={isOneToManyXECSend}>
          <SendToOneHolder>
            <SendToOneInputForm>
              <InputAndAliasPreviewHolder>
                <InputWithScanner
                  placeholder={`Address`}
                  name="address"
                  value={formData.address}
                  handleInput={handleAddressChange}
                  error={sendAddressError}
                  loadWithScannerOpen={false}
                />
              </InputAndAliasPreviewHolder>
              <SendXecInput
                name="amount"
                value={formData.amount}
                selectValue={selectedCurrency}
                fiatCode="USD"
                error={sendAmountError}
                handleInput={handleAmountChange}
                handleSelect={handleSelectedCurrencyChange}
                handleOnMax={onMax}
              />
            </SendToOneInputForm>
          </SendToOneHolder>
          <SendToManyHolder>
            <TextArea
              placeholder={`One address & amount per line, separated by comma \ne.g. \n${addrExample[0]},2.5 \n${addrExample[1]},1.7`}
              name="multiAddressInput"
              handleInput={e => handleMultiAddressChange(e)}
              value={formData.multiAddressInput}
              error={multiSendAddressError}
            />
          </SendToManyHolder>
        </InputModesHolder>
        <AmountPreviewCtn>
          {feeEstimate ? (
            <ConvertAmount>Fee (Estimate): {(selectedCurrency === appConfig.ticker ? toDCR(feeEstimate) : (toDCR(feeEstimate) * fiatPrice).toLocaleString(userLocale, {
              minimumFractionDigits: appConfig.cashDecimals,
              maximumFractionDigits: appConfig.cashDecimals,
            })) + ' ' + selectedCurrency}</ConvertAmount>
          ) : (<></>)}
          {isOneToManyXECSend ? (
            <LocaleFormattedValue>
              {formatBalance(multiSendTotal, userLocale) +
                ' ' +
                selectedCurrency}
            </LocaleFormattedValue>
          ) : (
            <LocaleFormattedValue>
              {!isNaN(formData.amount)
                ? formatBalance(
                  formData.amount,
                  userLocale,
                ) +
                ' ' +
                selectedCurrency
                : ''}
            </LocaleFormattedValue>
          )}
          <ConvertAmount>
            {fiatPriceString !== '' && '='} {fiatPriceString}
          </ConvertAmount>
        </AmountPreviewCtn>
        <WalletButtonRow>
          <PrimaryButton
            style={{ marginTop: '12px' }}
            disabled={disableSendButton}
            onClick={() => {
              checkForConfirmationBeforeSendXec();
            }}
          >
            Send
          </PrimaryButton>
        </WalletButtonRow>
      </HomeBackupArea>
    </>
  );
}

export default SendDCR;