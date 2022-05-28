import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {useEffect, useState} from 'react'
import web3modal, { providers } from 'web3modal';
import { BigNumber } from 'ethers';
import { utils } from 'ethers';

export default function Home() {

  const zero = BigNumber.from(0)
  const [walletConnected, setWalletConnected] = useState(false);
  const [tokensMinted, setTokensMinted] = useState(zero)
  const [balanceOfCDTokens, setBalanceofCDTokens] = useState(zero)
  const [tokenAmount, setTokenAmount] = useState(zero);

  const web3ModalRef = useRef(); 
  
  const mintCrytoDevTOken = async(amount) => {
    try {
      const signer = await getProviderOrSigner(true)
      const tokenContract = new Contract(
        
      )

    } catch (error) {
      console.log(error)
    }
  }

  const renderButton = async() => {
    
    return (
      <div style={{display: "flex-col"}}>
        <div>
          <input type="number" 
          placeholder='Amount of Tokens' 
          onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}/>

          <button className={styles.button} 
          disabled={!(tokenAmount>0)}
          onClick={() => mintCrytoDevTOken(tokenAmount)}>
            Mint Tokens</button>)
        </div>
      </div>
    )
  }

  const getProviderOrSigner = async(needSigner=false) => {
    const provider = await web3ModalRef.current.connect()
    const web3Provider = new providers.Web3Provider(provider)
    const { chainId } = web3Provider.getNetwork()

    if(chainId != 4){
      window.alert("Please connect to reinkeby tesnet first")
      throw new Error("Change to rinkeby network")
    }
    if(needSigner){
      const signer = web3Provider.getSigner()
      return signer;
    }
    return web3Provider;
  }

  const connectWallet = async() => {
    try {
      setWalletConnected(true)
      await getProviderOrSigner(); // to check for network

    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    if(!walletConnected){
      web3ModalRef.current = new web3modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false
      });
      connectWallet()
    }
  }, []);

  return (
    <div>
      <Head>
        <title>ICO-CryptoDev</title>
        <meta name="description" content="ICO-dApp"/>
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs ICO</h1>
          <div className={styles.description}>
            You can claim or mint Crypto Dev tokens here
          </div>
          {
            walletConnected ? (
              <div>
                <div className={styles.description}>
                    Till now {utils.formatEther(tokensMinted)}/1000 have been minted !!!
                </div>
                <div className={styles.description}>
                  You have minted {utils.formatEther(balanceOfCDTokens)} Cryptp Devs token for now
                </div>
                {renderButton()}
              </div>
              ) : ( 
                <button onClick={connectWallet} className={styles.button}>Connect</button>
              )
          }
        </div>
      </div>
    </div>
  )
}
