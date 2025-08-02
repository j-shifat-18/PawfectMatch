import { useEffect } from "react";
import Swal from "sweetalert2";
import db from "../utils/dexieDB";
import useAxiosSecure from "./useAxiosSecure";

const imageHostingKey = import.meta.env.VITE_IMAGE_UPLOAD_KEY;
const imageHostingUrl = `https://api.imgbb.com/1/upload?key=${imageHostingKey}`;

let isSyncing = false;

const useOfflineSync = () => {
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const syncData = async () => {
      if (isSyncing) return;
      isSyncing = true;

      try {
        const allOfflinePets = await db.pendingPets.toArray();

        for (const pet of allOfflinePets) {
          try {
            // Upload image
            const formData = new FormData();
            formData.append("image", pet.imageBlob);
            const imgRes = await fetch(imageHostingUrl, {
              method: "POST",
              body: formData,
            });

            const imgData = await imgRes.json();
            if (!imgData.success) throw new Error("Image upload failed during sync");

            pet.petData.images = [imgData.data.url];

            // Send to server
            await axiosSecure.post("/pets", pet.petData);

            // Remove from Dexie
            await db.pendingPets.delete(pet.id);

            Swal.fire({
              icon: "success",
              title: "Offline Pet Synced",
              text: `${pet.petData.name}'s profile has been uploaded to the server.`,
              timer: 3000,
              toast: true,
              position: "top-end",
              showConfirmButton: false,
            });
          } catch (err) {
            console.error("Sync failed for a pet:", err);
          }
        }
      } finally {
        isSyncing = false;
      }
    };

    if (navigator.onLine) {
      syncData();
    }

    window.addEventListener("online", syncData);
    return () => window.removeEventListener("online", syncData);
  }, [axiosSecure]);
};

export default useOfflineSync;
