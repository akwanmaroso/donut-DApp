import Head from "next/head";
import 'bulma/css/bulma.css'

import '../styles/Machine.module.css';
import Web3 from "web3";
import { useEffect, useState } from "react";
import vendingMachineContract from "../blockchain/vending";

const Machine = () => {
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [inventory, setInventory] = useState("")
    const [count, setCount] = useState("")
    const [quantity, setQuantity] = useState("")
    const [web3, setWeb3] = useState(null)
    const [address, setAddress] = useState(null)
    const [vmContract, setVmContract] = useState(null)

    useEffect(() => {
        if (vmContract) getInventoryHandler()
        if (vmContract && address) getDonutCountHandler()
    }, [vmContract, address, count])

    const getInventoryHandler = async () => {
        const inventory = await vmContract.methods.getVendingMachineBalance().call();
        setInventory(inventory);
    }

    const getDonutCountHandler = async () => {
        const count = await vmContract.methods.donutBalances(address).call();
        setCount(count);
    }

    const connectWalletHandler = async () => {
        if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
            try {
                await window.ethereum.request({ method: "eth_requestAccounts" })
                web3 = new Web3(window.ethereum)
                setWeb3(web3);

                const accounts = await web3.eth.getAccounts()
                setAddress(accounts[0]);

                const vm = vendingMachineContract(web3)
                setVmContract(vm)
            } catch (err) {
                setError(err.message);
            }
        } else {
            console.log("Please install metamask");
        }
    }

    const buyDonutHandler = async () => {
        try {
            await vmContract.methods.purchase(quantity).send({
                from: address,
                value: web3.utils.toWei('2', 'ether') * quantity
            })
            setCount(count++);
            setSuccess(`${quantity} donuts purchased!`)
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div>
            <Head>
                <title>Vanding Machine</title>
                <meta name="description" content="a DApp vending machine" />
            </Head>
            <navbar className="navbar mt-4 mb">
                <div className="container">
                    <div className="navbar-brand">
                        <h1>Vending Machine</h1>
                    </div>
                    <div className="navbar-end">
                        <button onClick={connectWalletHandler} className="button is-primary">Connect Wallet</button>
                    </div>
                </div>
            </navbar>
            <section>
                <div className="container">
                    <h2>Vanding Machine Inventory: {inventory}</h2>
                </div>
            </section>
            <section>
                <div className="container">
                    <h2>My Donuts: {count}</h2>
                </div>
            </section>
            <section className="mt-5">
                <div className="container">
                    <div className="field">
                        <div className="label">Buy donuts</div>
                        <div className="control">
                            <input className="input" onChange={(e) => setQuantity(e.target.value)} type="number" placeholder="Enter amount..." />
                        </div>
                        <button onClick={buyDonutHandler} className="button is-primary mt-4">Buy</button>
                    </div>
                </div>
            </section>
            <section>
                <div className="container has-text-danger">
                    <p>{error}</p>
                </div>
                <div className="container has-text-success">
                    <p>{success}</p>
                </div>
            </section>
        </div>
    )
}

export default Machine;