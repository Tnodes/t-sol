const fs = require("fs");
const web3 = require("@solana/web3.js");
const bs58 = require("bs58");
const readline = require("readline");

class SolanaTransfer {
  constructor(network = "mainnet-beta") {
    this.connection = new web3.Connection(
      web3.clusterApiUrl(network),
      "confirmed"
    );

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.spinner = ["|", "/", "-", "\\"];
    this.spinnerIndex = 0;
  }

  showBanner() {
    console.log(`
----------------------------------------
           ====== T-SOL ======
Transfer All SOL balance to one address
----------------------------------------
Author: Tnodes
Github: https://github.com/Tnodes
----------------------------------------            
            `);
  }

  async run() {
    try {
      this.showBanner();
      this.destinationAddress = await this.askDestinationAddress();
      const privateKeys = this.readPrivateKeys("private_key.txt");
      if (privateKeys.length === 0) {
        console.log("⚠️ No valid private keys found in private_key.txt");
        return;
      }

      console.log(`\n🚀 Starting transfers to ${this.destinationAddress}\n`);
      for (const privateKey of privateKeys) {
        await this.processAccount(privateKey);
      }

      console.log("\n🎉 All transfers completed! 🎉");
    } catch (error) {
      console.error("❌ An error occurred:", error.message);
    } finally {
      this.rl.close();
    }
  }

  askDestinationAddress() {
    return new Promise((resolve) => {
      this.rl.question("🏠 Enter the destination address: ", (address) => {
        resolve(address.trim());
      });
    });
  }

  readPrivateKeys(filename) {
    try {
      const content = fs.readFileSync(filename, "utf8");
      if (!content.trim()) {
        console.log("⚠️ private_key.txt is empty");
        return [];
      }

      return content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .filter((key) => {
          try {
            bs58.decode(key);
            return true;
          } catch (error) {
            console.log(`⚠️ Invalid private key: ${key.substring(0, 10)}...`);
            return false;
          }
        });
    } catch (error) {
      console.error("❌ Error reading private_key.txt:", error.message);
      return [];
    }
  }

  async processAccount(privateKey) {
    try {
      const sender = this.createKeypair(privateKey);
      console.log("\n----------------------------------------");
      console.log(`🔑 Processing account: ${sender.publicKey.toBase58()}`);
      const balance = await this.checkBalance(sender.publicKey);
      if (balance === 0) {
        console.log("⚠️ Skipping account with 0 balance.");
        return;
      }

      console.log(`💰 Initial balance: ${balance} SOL`);
      const amountToSend = await this.calculateAmountToSend(sender, balance);
      if (amountToSend <= 0) {
        console.log("⚠️ Insufficient funds after fee calculation.");
        return;
      }

      await this.sendTransaction(sender, amountToSend);
      const newBalance = await this.checkBalance(sender.publicKey);
      console.log(`💼 Final balance: ${newBalance} SOL`);
    } catch (error) {
      console.error(`❌ Error processing account: ${error.message}`);
    }
  }

  createKeypair(privateKey) {
    try {
      return web3.Keypair.fromSecretKey(
        Uint8Array.from(bs58.decode(privateKey))
      );
    } catch (error) {
      throw new Error(`Invalid private key: ${privateKey.substring(0, 10)}...`);
    }
  }

  startSpinner(message) {
    this.spinnerInterval = setInterval(() => {
      process.stdout.write(`\r${this.spinner[this.spinnerIndex]} ${message}`);
      this.spinnerIndex = (this.spinnerIndex + 1) % this.spinner.length;
    }, 100);
  }

  stopSpinner() {
    clearInterval(this.spinnerInterval);

    process.stdout.write("\r");
  }

  async checkBalance(publicKey) {
    this.startSpinner("Checking balance...");
    try {
      const balance = await this.connection.getBalance(publicKey);
      this.stopSpinner();
      return balance / web3.LAMPORTS_PER_SOL;
    } catch (error) {
      this.stopSpinner();
      throw error;
    }
  }

  async calculateAmountToSend(sender, totalBalance) {
    this.startSpinner("Calculating amount to send...");
    try {
      const simulationTx = await this.buildTransaction(sender, totalBalance);
      const fees = await this.calculateFees(simulationTx, sender);
      this.stopSpinner();
      return totalBalance - fees;
    } catch (error) {
      this.stopSpinner();
      throw error;
    }
  }

  async buildTransaction(sender, amount) {
    const { blockhash } = await this.connection.getLatestBlockhash();
    const transaction = new web3.Transaction({
      feePayer: sender.publicKey,

      recentBlockhash: blockhash,
    });

    transaction.add(
      web3.SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: new web3.PublicKey(this.destinationAddress),
        lamports: Math.floor(amount * web3.LAMPORTS_PER_SOL),
      })
    );

    return transaction;
  }

  async calculateFees(transaction, payer) {
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payer.publicKey;
    const fee = await transaction.getEstimatedFee(this.connection);
    return fee / web3.LAMPORTS_PER_SOL;
  }

  async sendTransaction(sender, amount) {
    this.startSpinner("Sending transaction...");
    try {
      const transaction = await this.buildTransaction(sender, amount);
      const signature = await web3.sendAndConfirmTransaction(
        this.connection,
        transaction,
        [sender]
      );

      this.stopSpinner();
      console.log(
        `✅ Transaction complete. Signature: https://solscan.io/tx/${signature}`
      );
      console.log(`💸 Sent ${amount} SOL to ${this.destinationAddress}`);
    } catch (error) {
      this.stopSpinner();
      throw error;
    }
  }
}

// Run the transfer
const transfer = new SolanaTransfer();
transfer.run();
