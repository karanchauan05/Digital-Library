import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Convert the file to a Buffer for axios/form-data compatibility in Node.js
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const pinataFormData = new FormData();
        // Append as a Blob/File which is supported in the new Node.js fetch/FormData
        pinataFormData.append("file", new Blob([buffer]), file.name);

        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", pinataFormData, {
            headers: {
                'pinata_api_key': process.env.PINATA_API_KEY,
                'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY,
            },
        });

        return NextResponse.json({ ipfsHash: res.data.IpfsHash });
    } catch (error: any) {
        console.error("Pinata upload error:", error.response?.data || error.message);
        return NextResponse.json({
            error: error.message || "Failed to upload to IPFS",
            details: error.response?.data
        }, { status: 500 });
    }
}
