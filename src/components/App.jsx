import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import '../assets/css/App.css';
import CoffeeImage from '../assets/img/favicon.png';
import abi from '../utils/BuyMeACoffee.json';

export default function App() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [readyToBuy, setReadyToBuy] = useState(false);
  const [message, setMessage] = useState('');

  const contractAddress = '0xCb1e7474147f1cd0a203489f2cab3C9c9CDD5d39';
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      // Check if ethereum object is injected
      if (!ethereum) {
        console.log('Make sure you have metamask!');
        return false;
      } else {
        console.log('We have the ethereum object', ethereum);
      }

      // Check if we're authorized to access the user's wallet
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
      } else {
        console.log('No authorized account found');
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Handles connect to wallet button
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const ready = () => {
    setReadyToBuy(true);

    if (message.length != 0) {
      buy();
    }
  };

  const submitMessage = (event) => {
    setMessage(event.target.value);
  };

  const buy = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffeeContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await buyMeACoffeeContract.getCoffeesBought();
        console.log('Retrieved total coffees bought', count.toNumber());

        // execute the buy method
        const buyTxn = await buyMeACoffeeContract.buy(message, {
          value: ethers.utils.parseEther('0.002'),
        });

        console.log('Mining...', buyTxn.hash);

        await buyTxn.wait();
        console.log('Mined -- ', buyTxn.hash);

        count = await buyMeACoffeeContract.getBuyers();
        console.log('Retrieved total wave count...', count);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          BuyMeACoffee <img src={CoffeeImage} className="coffeeImage"></img>
        </div>

        <div className="bio">
          <h3>Hi there! I'm Halfzombie</h3>
          <p></p>
          <p>I'm learning to go outside my comfort zone. 🥺👉🏽👈🏽</p>
          <p>Feel like cheering me on? 😀 </p>
        </div>
        {readyToBuy && (
          <textarea
            className="message"
            value={message}
            onChange={submitMessage}
            placeholder="Say Something Nice.."
          ></textarea>
        )}
        <button className="buyButton" onClick={ready}>
          Buy me a coffee
        </button>
        {!currentAccount && (
          <button className="connectWalletButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}