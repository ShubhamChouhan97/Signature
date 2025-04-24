// import React, { useEffect, useState } from "react";
// import { mainClient, useAppStore } from "../store";
// const viewDocumnet = async(flag:number)=>{
//     const pathSegments = location.pathname.split("/");
//     const bulkdataId = pathSegments[pathSegments.length - 2];
//     const rowId = pathSegments[pathSegments.length-1];
//     const [resData,setresData] = useState([]);
//      try {
//           const response = await mainClient.request("POST", "/api/request/qrverifypdf", {
//             responseType: "blob",
//             data: { bulkdataId,rowId,flag },
//           });
    
//           const blob = new Blob([response.data], { type: "application/pdf" });
//           const fileURL = window.URL.createObjectURL(blob);
//           window.open(fileURL, "_blank");
          
//         } catch (error) {
//           console.error("Error fetching requests:", error);
//         }
// }
// const Qrverify: React.FC = () => {
//   return (
//     <div className="flex justify-center items-center h-screen">
//       <div className="flex gap-5">
//         <button className="px-6 py-3 text-lg border border-blue-500 bg-blue-500 rounded-md hover:bg-blue-100 transition duration-300" 
//         onClick={() => viewDocumnet(1)}>
//           View Original Document
//         </button>
//         <button className="px-6 py-3 text-lg border border-blue-500 bg-blue-500 rounded-md hover:bg-blue-100 transition duration-300"
//         onClick={()=>viewDocumnet(2)}>
//           View Original Data
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Qrverify;


import React from "react";
import { mainClient } from "../store";

const viewDocument = async (flag: number) => {
  const pathSegments = location.pathname.split("/");
  const bulkdataId = pathSegments[pathSegments.length - 2];
  const rowId = pathSegments[pathSegments.length - 1];

  try {
    const response = await mainClient.request("POST","/api/request/qrverifypdf", {
      responseType: flag === 1 ? "blob" : "json",
      data: { bulkdataId, rowId, flag },
    });

    if (flag === 1) {
      const blob = new Blob([response.data], { type: "application/pdf" });
      const fileURL = window.URL.createObjectURL(blob);
      window.open(fileURL, "_blank");
    } else {
      console.log("Original Data:", response.data);
      alert(JSON.stringify(response.data, null, 2)); // Or render in a modal
    }
  } catch (error) {
    console.error("Error fetching document/data:", error);
  }
};

const Qrverify: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex gap-5">
        <button
          className="px-6 py-3 text-lg border border-blue-500 bg-blue-500 text-white rounded-md hover:bg-blue-100 hover:text-black transition duration-300"
          onClick={() => viewDocument(1)}
        >
          View Original Document
        </button>
        <button
          className="px-6 py-3 text-lg border border-blue-500 bg-blue-500 text-white rounded-md hover:bg-blue-100 hover:text-black transition duration-300"
          onClick={() => viewDocument(2)}
        >
          View Original Data
        </button>
      </div>
    </div>
  );
};

export default Qrverify;
