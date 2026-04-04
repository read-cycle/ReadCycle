<script setup lang="ts">
import { computed } from 'vue';
import AppImage from '../components/AppImage.vue';
import type { MatchedChatDoc } from '../interfaces';
import { getDisplayImageUrl } from '../utils/imageUrls';

const props = defineProps<{
  docData: [string, MatchedChatDoc];
  uploader: boolean;
}>();
const imageUrl = computed(() => getDisplayImageUrl(props.docData[1].listingImageThumb, props.docData[1].listingImage));
const unreadCount = computed(() => props.uploader
  ? props.docData[1].unreadCountForUploader ?? 0
  : props.docData[1].unreadCountForBuyer ?? 0
);
</script>

<template>
  <li class="chat-list-item" :class="{ 'chat-list-item--unread': unreadCount > 0 }">
    <div class="chat-list-item__cover">
      <AppImage v-if="imageUrl" :src="imageUrl" :alt="`${props.docData[1].title || 'Listing'} cover`" class="chat-list-item__cover-image" />
    </div>
    <div class="chat-list-item__content">
      <h3>{{ props.docData[1].title || 'Untitled' }}</h3>
      <p>{{ props.docData[1].grade || 'No grade' }}</p>
      <p>{{ uploader ? props.docData[1].buyerName : props.docData[1].uploaderName }}</p>
      <p v-if="props.docData[1].lastMessagePreview" class="chat-list-item__preview">{{ props.docData[1].lastMessagePreview }}</p>
    </div>
    <div class="chat-list-item__meta">
      <span v-if="unreadCount" class="chat-list-item__badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
      <span>₹{{ props.docData[1].price ?? 0 }}</span>
    </div>
  </li>
</template>

<style scoped lang="scss">
.chat-list-item {
  width: 100%;
  max-width: 100%;
  max-width: min(100%, 100vw);
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  cursor: pointer;
  overflow-x: hidden;
}

.chat-list-item--unread {
  background: rgba(58, 122, 254, 0.06);
}

.chat-list-item__cover {
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  border-radius: 12px;
  background: rgba(58, 122, 254, 0.08);
  overflow: hidden;
}

.chat-list-item__cover-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-list-item__content {
  flex: 0 1 80%;
  max-width: 80%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  overflow: hidden;
}

.chat-list-item__content h3,
.chat-list-item__content p {
  margin: 0;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-list-item__content h3 {
  font-family: 'Manrope';
  font-size: 0.95rem;
}

.chat-list-item__content p {
  font-family: 'Nunito';
  font-size: 0.9rem;
}

.chat-list-item__preview {
  color: rgba(15, 23, 42, 0.7);
}

.chat-list-item__meta {
  margin-left: auto;
  flex: 0 0 auto;
  font-family: 'Nunito';
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.375rem;
}

.chat-list-item__badge {
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.35rem;
  border-radius: 999px;
  background: #ef4444;
  color: white;
  font-family: 'Manrope';
  font-size: 0.75rem;
  line-height: 1.5rem;
  text-align: center;
}

@media (max-width: 640px) {
  .chat-list-item {
    gap: 0.625rem;
    padding: 0.625rem 0.25rem;
  }

  .chat-list-item__cover {
    width: 40px;
    height: 40px;
    flex-basis: 40px;
    border-radius: 10px;
  }

  .chat-list-item__content h3 {
    font-size: 0.9rem;
  }

  .chat-list-item__content p,
  .chat-list-item__meta {
    font-size: 0.82rem;
  }
}
</style>
