import signatures from '../models/signatures.js'


export const uploadSignature = async (req,res)=>{
   try{
    const file = req.file;
    const userId = req.session.userId;
    const signature = new signatures({ userId:userId, url:file.path});
    signature.save();
    res.status(200).json('Signature Uploaded Successfully')
   }catch{
    res.status(500).json('Error Uploading Signature')
   }
}

export const allSign = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const signatureList = await signatures.find({ userId });
        res.status(200).json(signatureList);
        
    } catch (error) {
        console.error("Error fetching signatures:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};