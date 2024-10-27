# T-SOL: Solana Balance Transfer Tool 🚀💰

T-SOL is a command-line tool that allows you to transfer the entire SOL balance from multiple Solana accounts to a single destination address.

## ✨ Features

- 💸 Transfer SOL from multiple accounts to one destination address
- 🔑 Read private keys from a file
- 🧮 Calculate and account for transaction fees
- 🚀 Automatic processing of all accounts without individual confirmations
- 📊 Display transaction details and balances
- 🔄 Loading spinner for network operations

## 🛠️ Prerequisites

- Node.js (v12 or higher)
- npm (Node Package Manager)

## 🚀 Installation

1. Clone this repository:
   ```
   git clone https://github.com/Tnodes/t-sol.git
   cd t-sol
   ```

2. Install the dependencies:
   ```
   npm install
   ```

## 📝 Usage

1. Create a file named `private_key.txt` in the project root directory.
2. Add the private keys **(only privatekey not pharse)** of the Solana accounts you want to transfer from, **one per line**.
3. Run the script:
   ```
   node index.js
   ```
4. Enter the destination address when prompted.
5. The script will automatically process all accounts and transfer the funds.

## 🔒 Security Notice

⚠️ **IMPORTANT**: Keep your `private_key.txt` file secure and never share it. Consider deleting it after use.

## ⚙️ Configuration

By default, the script connects to the Solana mainnet. To use a different network, modify the `network` parameter in the `SolanaTransfer` constructor in `index.js`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

@Tnodes

## 🛎️ Telegram

https://t.me/tdropid

## ⚠️ Disclaimer

This tool is provided as-is, without any warranties. Use at your own risk. Always double-check the destination address before running the script, as all transfers will proceed automatically once started.
