import axios from "axios";

/**
 * Uploads a file to IPFS via our secure internal API route.
 * This keeps the Pinata API keys on the server.
 */
export const uploadToIPFS = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post("/api/upload", formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return res.data.ipfsHash;
};

/**
 * Generates a URL for the content based on the configured Pinata gateway.
 */
export const getGatewayUrl = (hash: string) => {
    const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "gateway.pinata.cloud";
    return `https://${gateway}/ipfs/${hash}`;
};
