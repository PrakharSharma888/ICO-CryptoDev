import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {useEffect, useState, useRef} from 'react'
import web3modal from 'web3modal';
import { BigNumber } from 'ethers';
import { utils, Contract, ethers , providers } from 'ethers';
import { TOKEN_CONTRACT_ADDRESS, TOKEN_ABI , NFT_CONTRACT_ADDRESS, NFT_ABI} from '../constrants';

export default function Home() {

  const zero = BigNumber.from(0)
  const [walletConnected, setWalletConnected] = useState(false);
  const [tokensMinted, setTokensMinted] = useState(zero)
  const [balanceOfCDTokens, setBalanceofCDTokens] = useState(zero)
  const [tokenAmount, setTokenAmount] = useState(zero);
  const [loading, setLoading] = useState(false);
  const [tokensToBeClaimed, settokensToBeClaimed] = useState(zero)

  const web3ModalRef = useRef(); 

  const getTokensToBeClaimed = async() => {
    try {
      const provider = await getProviderOrSigner()

      const nftContract = new Contract( // has to be fetched via nt contract
        NFT_CONTRACT_ADDRESS,
        NFT_ABI,
        provider
      );
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_ABI,
        provider
      );

      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress()
      const balance = await nftContract.balanceOf(address)
      console.log(balance===zero)
      if(balance === zero){
        settokensToBeClaimed(zero)
        console.log("hehe")
      }
      else{
        var amount = 0;
        console.log("Bigva",BigNumber.from(balance._hex))
        for(var i=0; i<balance; i++){
          console.log("hehehehehehe")
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i)
          const claimed = await tokenContract.tokenIdsClaimed(tokenId)
          console.log("Claimed ",claimed)
          if(!claimed){
            amount++;
          }
        }
        
        settokensToBeClaimed(BigNumber.from(amount));
        console.log(amount)
      }

    } catch (error) {
      console.log(error)
      settokensToBeClaimed(zero)
    }
  }
  
  const getBalanceOfCDTokens = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_ABI,
        provider
      );

      const signer = await getProviderOrSigner(true)
      const address = signer.getAddress()
      const balance = await tokenContract.balanceOf(address)
      setBalanceofCDTokens(balance)

    } catch (error) {
      console.log(error)
    }
  }

  const getTotalTokenMinted = async () => {
    try {
      const provider = await getProviderOrSigner()

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_ABI,
        provider
      );

      const tokensMinted = await tokenContract.totalSupply(); //inbuilt
      setTokensMinted(tokensMinted)
    } catch (error) {
      console.log(error)
    }
  }

  const mintCrytoDevTOken = async(amount) => {
    try {
      const signer = await getProviderOrSigner(true)
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_ABI,
        signer
      );

      const value = 0.001 * amount
      const txn = await tokenContract.mint(amount, {
        value : utils.parseEther(value.toString())
      });
      setLoading(true)
      await txn.wait();
      setLoading(false)
      window.alert("You have successfully minted Crypto Dev Token");
      await getBalanceOfCDTokens(); //user balance
      await getTotalTokenMinted(); // overall tokens left
      await getTokensToBeClaimed(); // based on nfts user have

    } catch (error) {
      console.log(error)
    }
  }

  const claimCryptoDevTokens = async() =>{
    try {
      const signer = await getProviderOrSigner(true)
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_ABI,
        signer
      );

      const txn = await tokenContract.claim();
      setLoading(true);
      await txn.wait();
      setLoading(false);
      window.alert("Successfully claimed your Crypto Dev tokens");
      await getBalanceOfCDTokens(); //user balance
      await getTotalTokenMinted(); // overall tokens left
      await getTokensToBeClaimed(); // based on nfts user have

    } catch (error) {
      console.log(error)
    }
  }

  const renderButton = () => {

    if(loading){
      return(<div>
        <button className={styles.button}> Loading... </button>
      </div>)
    }

    if(tokensToBeClaimed > 0){
      return( <div>
        <div className={styles.description}>
          {tokensToBeClaimed * 10} Tokens can be claimed!
        </div>
        <button className={styles.button} onClick={claimCryptoDevTokens}>
          Claim your tokens
        </button>
      </div> )
    }

    return (
      <div style={{display: "flex-col"}}>
        <div>
          <input type="number" 
          placeholder='Amount of Tokens' 
          onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}/>

          <button className={styles.button} 
          disabled={!(tokenAmount>0)}
          onClick={() => mintCrytoDevTOken(tokenAmount)}>
            Mint Tokens</button>
        </div>
      </div>
    )
  }

  const getProviderOrSigner = async(needSigner=false) => {
    const provider = await web3ModalRef.current.connect()
    const web3Provider = new providers.Web3Provider(provider)
    const { chainId } = await web3Provider.getNetwork()
    console.log(chainId)

    if(chainId !== 4){
      window.alert("Please connect to rinkeby testnet first")
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
      connectWallet();
      getBalanceOfCDTokens(); //user balance
      getTotalTokenMinted(); // overall tokens left
      getTokensToBeClaimed(); // based on nfts user have
    }
  }, [walletConnected]);

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
                    Till now {utils.formatEther(balanceOfCDTokens)}/10000 have been minted !!!
                </div>
                <div className={styles.description}>
                  You have minted {utils.formatEther(tokensMinted)} Cryptp Devs token for now
                </div>
                {renderButton()}
              </div>
              ) : ( 
                <button onClick={connectWallet} className={styles.button}>Connect</button>
              )
          }
        </div>
        <div>
          <img src='./0.png' className={styles.Image}/>
        </div>
      </div>
      <footer className={styles.footer}>
        Made with &#10084; by Prakhar Sharma
      </footer>
    </div>
  )
}
