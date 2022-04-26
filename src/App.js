import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import './App.css'

import nft from './contracts/NFT.json'
import swap from './contracts/NFTSwap.json'

const nftContractAddress = "0xeC32adCa4A0Ca3D7c71e1c27Ee3A68dCfB893998"
const swapContractAddress = "0xBaEcc9246D00717447C1C956b201fCCF87dBbc87"
const nftAbi = nft.abi
const swapAbi = swap.abi

function App() {

  const [currentAccount, setCurrentAccount] = useState(null)
  const [tokenIds, setTokenIds] = useState([])
  const [approved, setApproval] = useState(false)
  const [loading, setLoading] = useState(false)

  const checkWalletIsConnected = async () => {
    const {ethereum} = window

    if (!ethereum) {
      console.log("Please install Metamask")
      return
    } else {
      console.log("Wallet exists, ready to go")
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' })

    if (accounts.length !== 0) {
      const account = accounts[0]
      console.log("Found an authorized account: ", account)
      setCurrentAccount(account)
    } else {
      console.log("No account found")
    }
  }

  const connectWalletHandler = async () => {
    const {ethereum} = window

    if (!ethereum) {
      alert("Please install Metamask")
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      console.log("Found an account. Address: ", accounts[0])
      setCurrentAccount(accounts[0])
    } catch (err) {
      console.log(err)
    }
  }

  const updateListHandler = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const accounts = await ethereum.request({ method: 'eth_accounts' })
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const swapContract = new ethers.Contract(swapContractAddress, swapAbi, signer)

        console.log("Approving NFTs")
        let update = await swapContract.updateList(accounts[0])

        console.log("Confirming....")
        await update.wait()

        alert("Complete, thank you")

        console.log(`Tx Hash: https://explorer.harmony.one/tx/${update.hash}`)

      } else {
        console.log("Ethereum object does not exist")
      }
    } catch (err) {
      console.log(err)
    }
  }

  const tokensOwnedHandler = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        setLoading(true)
        const arr = []
        const accounts = await ethereum.request({ method: 'eth_accounts' })
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const swapContract = new ethers.Contract(swapContractAddress, swapAbi, signer)

        console.log("Getting list of available tokens")
        let getList = await swapContract.getTokensAvailableForTransfer(accounts[0])

        for (let i = 0; i < getList.length; i++) {
          arr.push(getList[i].toNumber())
        }

        setLoading(false)
        setTokenIds(arr)
        console.log(tokenIds)

      }

    } catch (err) {
      console.log(err)
    }
  }

  const setApprovalHandler = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const oldNftContract = new ethers.Contract(nftContractAddress, nftAbi, signer)

        console.log("Approving NFTs")
        let approval = await oldNftContract.setApprovalForAll(swapContractAddress, true)

        console.log("Confirming....")
        await approval.wait()

        setApproval(true)

        console.log(`Tx Hash: https://explorer.harmony.one/tx/${approval.hash}`)

      } else {
        console.log("Ethereum object does not exist")
      }
    } catch (err) {
      console.log(err)
    }
  }

  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        Connect Wallet
      </button>
    )
  }

  const getListButton = () => {
    return (
      <button onClick={tokensOwnedHandler} className='cta-button mint-nft-button'>
        {loading ? "Please wait..." : "Get IDs"}
      </button>
    )
  }

  const updateListButton = () => {
    return (
      <button onClick={updateListHandler} className='cta-button mint-nft-button'>
        Update List
      </button>
    )
  }

  const approvalButton = () => {
    return (
      <button onClick={setApprovalHandler} className='cta-button connect-wallet-button'>
        Approve
      </button>
    )
  }

  const returnUserAddress = () => {
    return <h4>Connected with: 0x...{currentAccount.slice(currentAccount.length - 4, currentAccount.length)}</h4>
  }

  const returnUserIDs = () => {
    return <h4>Token IDs: {tokenIds.toString()}</h4>
  }

  const buttonChanger = () => {
    if (tokenIds.length > 0) {
      if (approved) {
        return updateListButton()
      } else {
        return approvalButton()
      }
    }
    return getListButton()
  }

  useEffect(() => {
    checkWalletIsConnected()
  }, [])

  return (
    <div className='main-app'>
      <h1>Stubborn KURO Upgrade Whitelist</h1>
      <br />
        <div>
          {currentAccount ? null : null}
        </div>
      <br />
      <br />
        <div>
          {currentAccount ? returnUserAddress() : null}
        </div>
      <br />
      <div>
        {currentAccount ? returnUserIDs() : null}
        {currentAccount ? buttonChanger() : connectWalletButton()}
      </div>
      <br />
      <br />
      <h3>1. Connect wallet</h3>
      <br />
      <h3>2. Get IDs (this looks for old Stubborn in your wallet)</h3>
      <h5>If Token IDs doesn't populate, you don't have Stubborn in this wallet</h5>
      <h5>Manually disconnect and try a different address</h5>
      <br />
      <h3>3. Approve</h3>
      <br />
      <h3>4. "Update" takes the old NFTs and whitelists you for upgrade</h3>
      <h5>Upgrades will happen in batches, not immediately, thanks!</h5>
      <h6>This app does not cost money, except gas for the approval and adding yourself to the whitelist</h6>
      <br />
    </div>
  )
}

export default App