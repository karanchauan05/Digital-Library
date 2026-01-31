# EduChain Lib - Decentralized Educational Terminal

An ultra-modern, blockchain-based digital library built on Polygon Amoy. Features include neural-link aesthetics, automated royalty streams, and IPFS-backed content security.

## 📂 Project Structure
- **/frontend**: Next.js 14 dApp with the Creator Terminal Dashboard and Library.
- **/blockchain**: Hardhat environment, Smart Contracts (Solidity), and Deployment scripts.

## 🚀 Live Build Configuration (Vercel)
If deploying to Vercel, ensure the following:
1. **Root Directory**: Set to `frontend`
2. **Environment Variables**:
   - `PINATA_API_KEY`: Your Pinata API Key
   - `PINATA_SECRET_API_KEY`: Your Pinata JWT/Secret
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`: Your Wallet public address
   - `NEXT_PUBLIC_PINATA_GATEWAY`: Your Pinata Gateway

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion, Ethers.js
- **Blockchain**: Solidity 0.8.20, Hardhat, Polygon Amoy Testnet
- **Storage**: Pinata (IPFS)

## ⛓️ Smart Contract
Deployed on Polygon Amoy at: `0x146cEd605d2BfF0Eee901AE210a24B18BD722d55`

---
*Developed for the PU Code Hackathon 3.0 - Revolutionizing Digital Education.*
