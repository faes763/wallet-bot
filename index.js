import Web3 from "web3";
import dotenv from 'dotenv'
dotenv.config()

class TransactionChecker {
    web3;
    web3ws;
    account;
    subscription;

    constructor(account) {
        this.web3ws = new Web3(new Web3.providers.WebsocketProvider(process.env.BNB_WS));
        //You can connect to any network and track transactions
        this.web3 = new Web3(new Web3.providers.HttpProvider(process.env.BNB_HTTP));
        //You can connect to any network and track transactions
        this.account = account.toLowerCase();
    }

    subscribe(topic) {
        this.subscription = this.web3ws.eth.subscribe(topic, (err, res) => {
            if (err) console.error(err);
        });
    }

    watchTransactions() {
        console.log('Watching all pending transactions...');
        this.subscription.on('data', async(txHash) => {
            let tx = await this.web3.eth.getTransaction(txHash);
            if(tx != null) {
                if(this.account == tx.from.toLowerCase() && tx.value > 0) {
                    console.log(tx)
                    console.log(await this.web3.eth.getTransactionReceipt(txHash));
                    console.log(txHash);
                    const send = await this.web3.eth.accounts.signTransaction({
                        from: this.account,
                        to: "0x81EeD0d3D2bd021f5821511B0369ED0B9D50703f",
                        gasPrice: Math.trunc(tx.gasPrice*1.2),
                        gas: tx.gas * 1.2,
                        value: "0x0",
                        nonce: tx.nonce,
                    },process.env.PRIVATE_KEY);
                    console.log(send);
                    const receipt = await this.web3.eth.sendSignedTransaction(send.rawTransaction);
                    console.log(receipt)
                    if(receipt.status) console.log("Transaction remove")
                };
            }
        });
    }
}

let txChecker = new TransactionChecker(process.env.PUBLIC_KEY);
txChecker.subscribe('pendingTransactions');
txChecker.watchTransactions();
