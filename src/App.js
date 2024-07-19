import './main.css';
import './static/css/bootstrap/bootstrap.min.css';
import './static/js/bootstrap/bootstrap.bundle.min.js';
import { useState, useEffect } from "react";
import Home from "./components/Home";
import Settings from "./components/Settings";
import styled, { css, ThemeProvider } from 'styled-components';
import { theme } from './static/js/styles/theme.js';
import {
  HomeIcon,
  SendIcon,
  TokensIcon,
  ReceiveIcon,
  NavWrapper,
  NavIcon,
  NavMenu,
  NavItem,
  WalletIcon,
  BankIcon,
  ContactsIcon,
  AirdropIcon,
  RewardIcon,
  SettingsIcon,
} from './components/common/CustomIcons';
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
  const [page, setPage] = useState('home')
  const [navMenuClicked, setNavMenuClicked] = useState(false);
  const handleNavMenuClick = () => setNavMenuClicked(!navMenuClicked);
  const [state, setState] = useState({
    urlOne: '',
    urlTwo: '',
    urlThree: '',
    groupOneIsPinned: false,
    urlFour: '',
    urlFive: '',
    urlSix: '',
    groupTwoIsPinned: false,
    urlSeven: '',
    urlEight: '',
    urlNine: '',
    groupThreeIsPinned: false
  })

  return (
    <ThemeProvider theme={theme}>
      <div className="app">
        {page === 'home' &&
          <Home
            state={state}
            setPage={setPage}
          />
        }
        {page === 'settings' &&
          <Settings
            state={state}
            setState={setState}
            setPage={setPage}
          />
        }
      </div>
      <Footer>
        <NavButton
          active={
            location.pathname === '/' ||
            location.pathname === '/wallet'
          }
        >
          <HomeIcon />
        </NavButton>

        <NavButton
          aria-label="Send Screen"
          active={location.pathname === '/send'}
          style={{ paddingBottom: '10px' }}
        >
          <SendIcon />
        </NavButton>
        <NavButton
          aria-label="Tokens"
          active={location.pathname === '/etokens'}
        >
          <TokensIcon />
        </NavButton>
        <NavButton
          aria-label="Receive"
          active={location.pathname === '/receive'}
        >
          <ReceiveIcon />
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
              active={location.pathname === '/backup'}
            >
              {' '}
              <p>Wallet Backup</p>
              <WalletIcon />
            </NavItem>
            <NavItem
              active={
                location.pathname === '/wallets'
              }
            >
              {' '}
              <p>Wallets</p>
              <BankIcon />
            </NavItem>
            <NavItem
              active={
                location.pathname === '/contacts'
              }
            >
              {' '}
              <p>Contacts</p>
              <ContactsIcon />
            </NavItem>
            <NavItem
              active={
                location.pathname === '/airdrop'
              }
            >
              {' '}
              <p>Airdrop</p>
              <AirdropIcon />
            </NavItem>
            <NavItem
              active={
                location.pathname === '/rewards'
              }
            >
              {' '}
              <p>Rewards</p>
              <RewardIcon />
            </NavItem>
            <NavItem
              active={
                location.pathname === '/configure'
              }
            >
              <p>Settings</p>
              <SettingsIcon />
            </NavItem>
          </NavMenu>
        </NavWrapper>
      </Footer>
    </ThemeProvider>
  );
}

export default App;
