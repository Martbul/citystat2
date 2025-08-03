import { UploadRouter } from "@/app/api/uploadthing+api";
import { generateReactNativeHelpers } from "@uploadthing/expo";


export const { useImageUploader, useDocumentUploader } =
  generateReactNativeHelpers<UploadRouter>({
    /**
     * Your server url.
     * @default process.env.EXPO_PUBLIC_SERVER_URL
     * @remarks In dev we will also try to use Expo.debuggerHost
     */
    url: "https://my-server.com",
  });
