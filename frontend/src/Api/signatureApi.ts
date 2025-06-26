// src/api/signatureApi.ts
import { mainClient } from "../store";

interface SignatureItem {
  url: string;
}

export const fetchSignatures = async (): Promise<string[]> => {
try {
    const response = await mainClient.request("GET", "/api/signatures/allSign");
    const data: SignatureItem[] = response.data;
    return data.map((item: SignatureItem) => `http://localhost:3000/${item.url}`);
  } catch (error) {
    console.error("Error fetching signatures:", error);
    throw error;
  }
};

export const uploadSignature = async (file: File) => {
  const formData = new FormData();
  formData.append("signature", file); // Must match server field

  return mainClient.request("POST", "/api/signatures/uploadSignature", {
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
