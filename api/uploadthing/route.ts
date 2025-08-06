import { createUploadthing, type FileRouter } from "uploadthing/next";
import { createRouteHandler } from "uploadthing/server";

const f = createUploadthing();

const uploadRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // This won't actually run since you're using Go backend
      return { userId: "placeholder" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This won't actually run since you're using Go backend
      return { uploadedBy: metadata.userId };
    }),
    
  documentUploader: f({ blob: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      return { userId: "placeholder" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;

// These exports won't be used since you have a Go backend
const handlers = createRouteHandler({
  router: uploadRouter,
});

export { handlers as GET, handlers as POST };