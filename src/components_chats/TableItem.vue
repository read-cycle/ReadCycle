<script setup lang="ts">
import { computed } from 'vue';
import type { BuyerRequestedDoc } from '../interfaces';
import type { DocumentReference } from 'firebase/firestore';

const props = defineProps<{
  docData: [DocumentReference, BuyerRequestedDoc];
  uploader: boolean;
}>();
const imageUrl = computed(() => props.docData[1].listingImage);
</script>

<template>
  <li class="chat-list-item">
    <div class="chat-list-item__cover" :style="imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined"></div>
    <div class="chat-list-item__content">
      <h3>{{ props.docData[1].title || 'Untitled' }}</h3>
      <p>{{ props.docData[1].grade || 'No grade' }}</p>
      <p>{{ uploader ? props.docData[1].buyerName : props.docData[1].uploaderName }}</p>
    </div>
    <div class="chat-list-item__meta">₹{{ props.docData[1].price ?? 0 }}</div>
  </li>
</template>

<style scoped lang="scss">
.chat-list-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  cursor: pointer;
}

.chat-list-item__cover {
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  border-radius: 12px;
  background: rgba(58, 122, 254, 0.08);
  background-size: cover;
  background-position: center;
}

.chat-list-item__content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.chat-list-item__content h3,
.chat-list-item__content p {
  margin: 0;
  max-width: 300px;
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

.chat-list-item__meta {
  margin-left: auto;
  font-family: 'Nunito';
}
</style>
