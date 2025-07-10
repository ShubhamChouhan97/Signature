// src/api/signatureApi.ts
import { mainClient } from "../store";

interface Signature {
  url: string;
  _id: string;
}


export const fetchSignatures = async (): Promise<Signature[]> => {
  const response = await mainClient.request("GET", "/api/signatures/allSign");
  const data: Signature[] = response.data;
  return data.map(item => ({
    ...item,
    url: `http://localhost:3000/${item.url}`,
  }));
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

export const deleteSignature = async(id:string)=>{
  // console.log("sign id",id)
const res = await mainClient.request("POST","/api/signatures/DeleteSign",{
  data:{id:id},
  headers:{
    "Content-Type":"application/json"
    }
 })
 return res.data;
}