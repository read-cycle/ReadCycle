export const COLLECTIONS = {
  uploadPool: 'uploadPool',
  watchlist: 'watchlist',
  buyerRequested: 'buyerRequested',
  matched: 'matched',
  statsEvents: 'stats_events'
} as const;

export const STORAGE_PATHS = {
  uploadPoolListingImage(listingId: string) {
    return {
      display: `${COLLECTIONS.uploadPool}/${listingId}/listingImage/display.webp`,
      thumb: `${COLLECTIONS.uploadPool}/${listingId}/listingImage/thumb.webp`
    };
  },
  uploadPoolExtraImage(listingId: string, index: number) {
    return {
      display: `${COLLECTIONS.uploadPool}/${listingId}/extraImages/${index}-display.webp`,
      thumb: `${COLLECTIONS.uploadPool}/${listingId}/extraImages/${index}-thumb.webp`
    };
  },
  matchedMessageAttachment(matchId: string, messageId: string, index: number) {
    return `${COLLECTIONS.matched}/${matchId}/${messageId}/${index}-attachment.webp`;
  },
  matchedMessageAttachmentThumb(matchId: string, messageId: string, index: number) {
    return `${COLLECTIONS.matched}/${matchId}/${messageId}/${index}-attachment-thumb.webp`;
  }
} as const;
