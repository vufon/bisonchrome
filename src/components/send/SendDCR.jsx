import styled from 'styled-components';
import Switch from '../common/Switch';
import React, { useState } from 'react';
import appConfig from '../../config/app';
import { formatBalance } from '../../utils/formatting';
import { ConvertAmount, TxLink } from '../common/Atoms';
import { getUserLocale } from '../../utils/helpers';
import PrimaryButton from '../common/Buttons';
import {
  InputWithScanner,
  SendXecInput,
  TextArea,
} from '../common/Inputs';

const SendXecForm = styled.div`
    margin: 12px 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;
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
  const tempFormData = emptyFormData
  tempFormData.address = addressInput
  const [isOneToManyXECSend, setIsOneToManyXECSend] = useState(false);
  const [txInfoFromUrl, setTxInfoFromUrl] = useState(false);
  const [formData, setFormData] = useState(tempFormData);
  const [sendAddressError, setSendAddressError] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(appConfig.ticker);
  const [sendAmountError, setSendAmountError] = useState(false);
  const [sendWithOpReturnRaw, setSendWithOpReturnRaw] = useState(false);
  // const [opReturnRawError, setOpReturnRawError] = useState(false);
  // const [parsedOpReturnRaw, setParsedOpReturnRaw] = useState({
  //   protocol: '',
  //   data: '',
  // });
  let multiSendTotal = 0;
  const handleAddressChange = async e => {
  };
  const handleSelectedCurrencyChange = e => {
    setSelectedCurrency(e.target.value);
    // Clear input field to prevent accidentally sending 1 XEC instead of 1 USD
    setFormData(p => ({
      ...p,
      amount: '',
    }));
  };
  const onMax = () => {
  }
  const handleAmountChange = e => {
    const { value, name } = e.target;

    // Validate user input send amount
    const isValidAmountOrErrorMsg = true

    setSendAmountError(
      isValidAmountOrErrorMsg !== true ? isValidAmountOrErrorMsg : false,
    );

    setFormData(p => ({
      ...p,
      [name]: value,
    }));
  };

  const userLocale = getUserLocale(navigator);
  let fiatPriceString = '';
  const handleMultiAddressChange = e => {
  };
  const [multiSendAddressError, setMultiSendAddressError] = useState(false);

  return (
    <>
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
                disabled={txInfoFromUrl !== false}
                handleInput={handleAddressChange}
                error={sendAddressError}
                loadWithScannerOpen={false}
              />
              <AliasAddressPreviewLabel>
                <TxLink
                  key="lsadkgjskdgsdgsdgasdsdg"
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                >
                </TxLink>
              </AliasAddressPreviewLabel>
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
            placeholder={`One address & amount per line, separated by comma \ne.g. \necash:qpatql05s9jfavnu0tv6lkjjk25n6tmj9gkpyrlwu8,500 \necash:qzvydd4n3lm3xv62cx078nu9rg0e3srmqq0knykfed,700`}
            name="multiAddressInput"
            handleInput={e => handleMultiAddressChange(e)}
            value={formData.multiAddressInput}
            error={multiSendAddressError}
          />
        </SendToManyHolder>
      </InputModesHolder>
      <SendXecForm>
        <SendXecRow>
          <SwitchAndLabel>
            <Switch
              name="Toggle Cashtab Msg"
              on="✉️"
              off="✉️"
              checked={false}
              disabled={false}
            />
            <SwitchLabel>Cashtab Msg</SwitchLabel>
          </SwitchAndLabel>
        </SendXecRow>
        <SendXecRow>
          <SwitchAndLabel>
            <Switch
              name="Toggle op_return_raw"
              checked={sendWithOpReturnRaw}
              disabled={false}
            />
            <SwitchLabel>op_return_raw</SwitchLabel>
          </SwitchAndLabel>
        </SendXecRow>
      </SendXecForm>

      <AmountPreviewCtn>
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
      <PrimaryButton
        style={{ marginTop: '12px' }}
        disabled={false}
      >
        Send
      </PrimaryButton>
    </>
  );
}

export default SendDCR;