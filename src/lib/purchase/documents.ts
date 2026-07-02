export const ALLOWED_APPLICATION_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
] as const;

export const MAX_APPLICATION_FILE_MB = 10;

export const APPLICATION_UPLOAD_FOLDER = "shiv-insurance/applications";

export interface ApplicationUploadedFile {
  mediaId: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  fieldKey: string;
  uploadedAt: string;
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export function getApplicationUploadConfig() {
  return {
    enabled: isCloudinaryConfigured(),
    maxFileMb: MAX_APPLICATION_FILE_MB,
    allowedMimeTypes: [...ALLOWED_APPLICATION_MIME_TYPES],
    allowedExtensions: [".pdf", ".jpg", ".jpeg", ".png"],
  };
}

export function validateApplicationFile(file: File): string | null {
  if (
    !ALLOWED_APPLICATION_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_APPLICATION_MIME_TYPES)[number]
    )
  ) {
    return "File type not allowed. Use PDF, JPG, or PNG.";
  }

  if (file.size > MAX_APPLICATION_FILE_MB * 1024 * 1024) {
    return `File must be under ${MAX_APPLICATION_FILE_MB}MB`;
  }

  return null;
}
