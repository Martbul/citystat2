import { generateReactNativeHelpers } from "@uploadthing/expo";

// Remove the route import since you don't need it
export const { useImageUploader, useDocumentUploader } =
  generateReactNativeHelpers({
    url: "https://citystatapi.onrender.com/api/uploadthing", // Your Go server URL
  });