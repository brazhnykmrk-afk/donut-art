/**
 * Client-side upload flow:
 *   1. Ask the API for a signed upload URL (validates type/size, requires auth)
 *   2. PUT the file directly to object storage — bytes never touch our server
 *   3. Return the storage key + public URL for the metadata request
 */
export async function uploadImage(
  file: File,
  kind: "artwork" | "avatar",
): Promise<{ key: string; publicUrl: string }> {
  const response = await fetch("/api/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileType: file.type,
      fileSize: file.size,
      kind,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error?.message ?? "Could not prepare the upload.");
  }

  const upload = (await response.json()) as
    | { driver: "blob" }
    | { uploadUrl: string; key: string; publicUrl: string };

  // Vercel Blob has its own client-upload protocol (token via
  // /api/uploads/blob, then a direct upload to the blob store).
  if ("driver" in upload) {
    const { upload: blobUpload } = await import("@vercel/blob/client");
    const blob = await blobUpload(`${kind}/${file.name}`, file, {
      access: "public",
      handleUploadUrl: "/api/uploads/blob",
      contentType: file.type,
    });
    return { key: blob.url, publicUrl: blob.url };
  }

  const { uploadUrl, key, publicUrl } = upload;

  const put = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!put.ok) {
    throw new Error("Uploading the image to storage failed. Please try again.");
  }

  return { key, publicUrl };
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error?.message ?? "Something went wrong.");
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
