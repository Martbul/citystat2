import { generateReactNativeHelpers } from "@uploadthing/expo";

export const { useImageUploader, useDocumentUploader } =
  generateReactNativeHelpers({
    url: "https://citystatapi.onrender.com/api/uploadthing",
  });