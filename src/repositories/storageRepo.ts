import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase-init';
import { STORAGE_PATHS } from './firebasePaths';

const CACHE_CONTROL = 'public,max-age=31536000,immutable';

export async function uploadListingImageSet(listingId: string, displayFile: Blob, thumbFile: Blob) {
  const paths = STORAGE_PATHS.uploadPoolListingImage(listingId);
  const displayRef = storageRef(storage, paths.display);
  const thumbRef = storageRef(storage, paths.thumb);

  await Promise.all([
    uploadBytes(displayRef, displayFile, { cacheControl: CACHE_CONTROL, contentType: 'image/webp' }),
    uploadBytes(thumbRef, thumbFile, { cacheControl: CACHE_CONTROL, contentType: 'image/webp' })
  ]);

  const [listingImageUrl, listingImageThumbUrl] = await Promise.all([
    getDownloadURL(displayRef),
    getDownloadURL(thumbRef)
  ]);

  return { listingImageUrl, listingImageThumbUrl };
}

export async function uploadListingExtraImageSet(listingId: string, index: number, displayFile: Blob, thumbFile: Blob) {
  const paths = STORAGE_PATHS.uploadPoolExtraImage(listingId, index);
  const displayRef = storageRef(storage, paths.display);
  const thumbRef = storageRef(storage, paths.thumb);

  await Promise.all([
    uploadBytes(displayRef, displayFile, { cacheControl: CACHE_CONTROL, contentType: 'image/webp' }),
    uploadBytes(thumbRef, thumbFile, { cacheControl: CACHE_CONTROL, contentType: 'image/webp' })
  ]);

  const [imageUrl, imageThumbUrl] = await Promise.all([
    getDownloadURL(displayRef),
    getDownloadURL(thumbRef)
  ]);

  return { imageUrl, imageThumbUrl };
}

export async function uploadMatchedMessageAttachmentSet(
  matchId: string,
  messageId: string,
  index: number,
  displayFile: Blob,
  thumbFile: Blob
) {
  const displayRef = storageRef(storage, STORAGE_PATHS.matchedMessageAttachment(matchId, messageId, index));
  const thumbRef = storageRef(storage, STORAGE_PATHS.matchedMessageAttachmentThumb(matchId, messageId, index));

  await Promise.all([
    uploadBytes(displayRef, displayFile, { cacheControl: CACHE_CONTROL, contentType: 'image/webp' }),
    uploadBytes(thumbRef, thumbFile, { cacheControl: CACHE_CONTROL, contentType: 'image/webp' })
  ]);

  const [imageUrl, imageThumbUrl] = await Promise.all([
    getDownloadURL(displayRef),
    getDownloadURL(thumbRef)
  ]);

  return { imageUrl, imageThumbUrl };
}
