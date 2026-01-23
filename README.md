# EduChain Lib - Blockchain Digital Library

A decentralized educational library built on Polygon Amoy, featuring royalty distribution and anti-piracy measures.

## Features
- **Wallet Integration**: Connect with MetaMask.
- **Content Upload**: Upload educational assets (PDFs, Videos, etc.) to IPFS.
- **Royalty System**: Creators receive 100% of the initial sale and (optional) secondary royalties.
- **Anti-Piracy**: Full content hashes are hidden on-chain and only revealed to purchasers.
- **Modern UI**: Glassmorphic design with Framer Motion animations.

## Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion, Ethers.js
- **Blockchain**: Solidity, Hardhat, Polygon Amoy Testnet
- **Storage**: Pinata (IPFS)

## Quick Start

### 1. Smart Contract Deployment
1. Navigate to `blockchain/`
2. Run `npm install`
3. Create a `.env` file with `PRIVATE_KEY=your_key`
4. Deploy: `npx hardhat run scripts/deploy.js --network amoy`
5. Copy the deployed address.

### 2. Frontend Setup
1. Navigate to `frontend/`
2. Run `npm install`
3. Create a `.env.local` file (copy from `.env.local.example`)
4. Fill in `NEXT_PUBLIC_PINATA_JWT` and `NEXT_PUBLIC_CONTRACT_ADDRESS`
5. Run: `npm run dev`

## Deployment Details
- **Network**: Polygon Amoy Testnet
- **Contract Address**: `0x146cEd605d2BfF0Eee901AE210a24B18BD722d55`
- **RPC**: https://rpc-amoy.polygon.technology
- **Chain ID**: 80002
