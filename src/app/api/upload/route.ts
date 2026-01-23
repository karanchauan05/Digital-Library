import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const pinataFormData = new FormData();
        pinataFormData.append("file", file);

        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", pinataFormData, {
            headers: {
                'Content-Type': `multipart/form-data`,
                'pinata_api_key': process.env.PINATA_API_KEY,
                'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY,
            },
        });

        return NextResponse.json({ ipfsHash: res.data.IpfsHash });
    } catch (error: any) {
        console.error("Pinata upload error:", error);
        return NextResponse.json({ error: error.message || "Failed to upload to IPFS" }, { status: 500 });
    }
}
