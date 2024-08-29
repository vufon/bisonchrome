import React, { useState, useEffect } from 'react';
import './main.css';
import './static/css/bootstrap/bootstrap.min.css';
import './static/js/bootstrap/bootstrap.bundle.min.js';
import Home from "./components/Home";
import SendDCR from "./components/send/SendDCR.jsx";
import ReceiveDCR from "./components/receive/ReceiveDCR.jsx";
import Wallets from "./components/wallets/index.js"
import OnBoarding from './components/onboarding/index.js';
import styled, { css, ThemeProvider } from 'styled-components';
import { theme } from './static/js/styles/theme.js';
import BalanceArea from "./components/BalanceArea";
import { getWalletState } from './utils/helpers.js';
import { isValidCashtabWallet } from './validation/index.js'
import Spinner from './components/common/Spinner.js';
import { LoadingCtn } from './components/common/Atoms';
import { CashtabNotification } from './components/app/styles.js'
import { Bounce } from 'react-toastify';
import Contacts from './components/contacts';
import 'react-toastify/dist/ReactToastify.min.css';
import {
  HomeIcon,
  SendIcon,
  ReceiveIcon,
  NavWrapper,
  NavIcon,
  NavMenu,
  NavItem,
  WalletIcon,
  BankIcon,
  ContactsIcon,
  SettingsIcon,
} from './components/common/CustomIcons';
import BackupWallet from './components/backupwallet/BackupWallet.js';
import Configure from './components/configure/Configure.js';
import { WalletContext } from './wallet/context';

export const NavButton = styled.button`
    :focus,
    :active {
        outline: none;
    }
    @media (hover: hover) {
        :hover {
            svg,
            g,
            path {
                fill: ${props => props.theme.eCashPurple};
            }
        }
    }
    width: 100%;
    height: 100%;
    cursor: pointer;
    padding: 0;
    background: none;
    border: none;
    font-size: 10px;
    svg {
        fill: ${props => props.theme.contrast};
        width: 30px;
        height: 30px;
    }
    g,
    path {
        fill: ${props => props.theme.contrast};
    }
    ${({ active, ...props }) =>
    active &&
    `    
        color: ${props.theme.navActive};
        svg, g, path {
            fill: ${props.theme.navActive};
        }
  `}
`;

const AppPositionCss = css`
    width: 500px;
    background: ${props => props.theme.walletBackground};
    -webkit-box-shadow: 0px 0px 24px 1px ${props => props.theme.shadow};
    -moz-box-shadow: 0px 0px 24px 1px ${props => props.theme.shadow};
    box-shadow: 0px 0px 24px 1px ${props => props.theme.shadow};
    @media (max-width: 768px) {
        width: 100%;
        -webkit-box-shadow: none;
        -moz-box-shadow: none;
        box-shadow: none;
    }
`;

export const Footer = styled.div`
    ${AppPositionCss}
    z-index: 2;
    height: 80px;
    border-top: 1px solid rgba(255, 255, 255, 0.5);
    position: fixed;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0;
`;

function App() {
  const ContextValue = React.useContext(WalletContext);
  const { updateDecredState, decredState, cashtabLoaded, loading, fiatPrice } = ContextValue;
  const { wallets, settings, } = decredState;
  const wallet = wallets.length > 0 ? wallets[0] : false;
  const walletState = getWalletState(wallet);
  const [page, setPage] = useState('home')
  const [sendAddress, setSendAddress] = useState('');
  const [navMenuClicked, setNavMenuClicked] = useState(false);
  const handleNavMenuClick = () => setNavMenuClicked(!navMenuClicked);
  const validWallet = isValidCashtabWallet(wallet);

  const setSendPage = async (address) => {
    setSendAddress(address)
    setPage('send')
  }

  const openNewTab = () => {
    window.open(`index.html`);
  }

  return (
    <ThemeProvider theme={theme}>
      <CashtabNotification
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      <div className="app">
        <div className="container">
          <div class="top-banner d-flex justify-content-between">
            <div></div>
            <img src="/images/logo.png" alt="cashtab" class="main-logo" />
            <img src="/images/popout.svg" alt="Open in tab" width="25" height="25" onClick={openNewTab} class="cursor-pointer" />
          </div>
          {loading || (wallet !== false && !validWallet && <Spinner />)}
          {!cashtabLoaded ? (
            <LoadingCtn title="Wallet Power Loading" />
          ) : (
            <>
              {wallet === false ? (
                <OnBoarding />
              ) : (
                <>
                  <BalanceArea
                    wallets={wallets}
                    settings={settings}
                    fiatPrice={fiatPrice}
                    updateDecredState={
                      updateDecredState
                    }
                    userLocale={navigator.language}
                  />
                  {page === 'home' &&
                    <Home setPage={setPage} />
                  }
                  {page === 'send' &&
                    <SendDCR addressInput={sendAddress} />
                  }
                  {page === 'receive' &&
                    <ReceiveDCR />
                  }
                  {page === 'wallets' &&
                    <Wallets />
                  }
                  {page === 'backup' &&
                    <BackupWallet />
                  }
                  {page === 'contacts' &&
                    <Contacts setSendPage={setSendPage} />
                  }
                  {page === 'configure' &&
                    <Configure />
                  }
                </>
              )}
            </>
          )}
        </div>
      </div>
      <Footer>
        <NavButton
          aria-label="Home Screen"
          active={
            page === 'home'
          }
          onClick={() => setPage('home')}
        >
          <HomeIcon />
        </NavButton>

        <NavButton
          aria-label="Send Screen"
          active={page === 'send'}
          style={{ paddingBottom: '10px' }}
          onClick={() => setPage('send')}
        >
          <SendIcon />
        </NavButton>
        <NavButton
          aria-label="Receive Screen"
          active={page === 'receive'}
          onClick={() => setPage('receive')}
        >
          <ReceiveIcon />
        </NavButton>
        <NavButton
          aria-label="Wallets"
          active={page === 'wallets'}
          onClick={() => setPage('wallets')}
        >
          <BankIcon />
        </NavButton>
        <NavWrapper
          title="Show Other Screens"
          onClick={handleNavMenuClick}
        >
          <NavIcon clicked={navMenuClicked} />
          <NavMenu
            title="Other Screens"
            open={navMenuClicked}
          >
            <NavItem
              active={page === 'backup'}
              onClick={() => setPage('backup')}
            >
              {' '}
              <p className={page === 'backup' ? 'nav-active' : ''}>Wallet Backup</p>
              <WalletIcon />
            </NavItem>
            <NavItem
              active={page === 'contacts'}
              onClick={() => setPage('contacts')}
            >
              {' '}
              <p className={page === 'contacts' ? 'nav-active' : ''}>Contacts</p>
              <ContactsIcon />
            </NavItem>
            <NavItem
              active={
                page === 'configure'
              }
              onClick={() => setPage('configure')}
            >
              <p className={page === 'configure' ? 'nav-active' : ''}>Settings</p>
              <SettingsIcon />
            </NavItem>
          </NavMenu>
        </NavWrapper>
      </Footer>
    </ThemeProvider>
  );
}

export default App;
