import type { FileRouter } from "uploadthing/server";
import { createUploadthing, UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

const uploadRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const user = await auth(req);

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(({ file, metadata }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.ufsUrl);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;
export type UploadRouter = typeof uploadRouter;

// import { createUploadthing, type FileRouter } from "uploadthing/next";

// const f = createUploadthing();

// export const ourFileRouter = {
//   imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
//     .middleware(async ({ req }) => {
//       // Add your auth logic here
//       return { userId: "user123" };
//     })
//     .onUploadComplete(async ({ metadata, file }) => {
//       console.log("Upload complete for userId:", metadata.userId);
//       console.log("file url", file.url);
//       return { uploadedBy: metadata.userId, fileUrl: file.url };
//     }),
// } satisfies FileRouter;

// export type OurFileRouter = typeof ourFileRouter;
