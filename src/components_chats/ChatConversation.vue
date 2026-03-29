<script setup lang="ts">
import LoadingButton from '../components/LoadingButton.vue';
import type { FirestoreRecord } from '../composables/firestore';
import type { BuyerRequestedDoc, ChatDisplayItem } from '../interfaces';
import { PaperclipIcon, SendIcon } from 'lucide-vue-next';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps<{
  currentDoc: FirestoreRecord<BuyerRequestedDoc> | null;
  displayItems: ChatDisplayItem[];
  currentUserId: string;
  inputValue: string;
  selectedFiles: FileList | null;
  sending: boolean;
}>();

const emit = defineEmits<{
  'update:inputValue': [string];
  submit: [];
  filesSelected: [FileList | null];
}>();

const attachmentInput = ref<HTMLInputElement | null>(null);
const messagesContainer = ref<HTMLDivElement | null>(null);
const attachmentPreviewUrls = ref<string[]>([]);
const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit'
});

const hasMessages = computed(() => props.displayItems.some((item) => item.type === 'message'));

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  emit('filesSelected', input.files);
}

function getMessageImages(item: ChatDisplayItem) {
  if (!item.message) return [];
  const multiImageList = item.message.imageUrls?.filter(Boolean) ?? [];

  if (multiImageList.length > 0) {
    return multiImageList;
  }

  return item.message.imageUrl ? [item.message.imageUrl] : [];
}

function formatMessageDateTime(item: ChatDisplayItem) {
  const messageDate = item.message?.timestamp?.toDate?.();
  return messageDate ? dateTimeFormatter.format(messageDate) : '';
}

function revokeAttachmentPreviewUrls() {
  attachmentPreviewUrls.value.forEach((url) => URL.revokeObjectURL(url));
  attachmentPreviewUrls.value = [];
}

async function scrollMessagesToBottom(behavior: ScrollBehavior = 'smooth') {
  await nextTick();

  if (!messagesContainer.value) return;

  messagesContainer.value.scrollTo({
    top: messagesContainer.value.scrollHeight,
    behavior
  });
}

watch(
  () => props.currentDoc?.[0].id,
  () => {
    void scrollMessagesToBottom('auto');
  }
);

watch(
  () => props.displayItems.length,
  () => {
    void scrollMessagesToBottom('smooth');
  }
);

watch(
  () => props.selectedFiles,
  (nextFiles) => {
    revokeAttachmentPreviewUrls();

    if (!nextFiles?.length) {
      if (attachmentInput.value) attachmentInput.value.value = '';
      return;
    }

    attachmentPreviewUrls.value = Array.from(nextFiles).map((file) => URL.createObjectURL(file));
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  revokeAttachmentPreviewUrls();
});
</script>

<template>
  <input
    type="file"
    accept="image/*"
    ref="attachmentInput"
    multiple
    @change="onFileChange"
    style="display: none"
  />
  <section class="chat-panel">
    <header class="chat-panel__header" v-if="currentDoc">
      <div>
        <h2>{{ currentDoc[1].title || 'Select a chat' }}</h2>
        <p>{{ currentDoc[1].grade || '' }}</p>
      </div>
      <div class="chat-panel__price">₹{{ currentDoc[1].price ?? 0 }}</div>
    </header>

    <div ref="messagesContainer" class="chat-panel__messages">
      <p v-if="!hasMessages" class="chat-panel__empty">Select a chat to start the conversation.</p>
      <div v-for="(item, index) in displayItems" :key="index" class="chat-message" :class="{ 'chat-message--me': item.message?.senderID === currentUserId, 'chat-message--other': item.message?.senderID !== currentUserId }">
        <div class="chat-message__meta">
          <div class="chat-message__author">{{ item.message?.sender }}</div>
          <time class="chat-message__timestamp" :datetime="item.message?.timestamp?.toDate?.()?.toISOString?.()">
            {{ formatMessageDateTime(item) }}
          </time>
        </div>
        <div class="chat-message__body">
          <p v-if="item.message?.text">{{ item.message.text }}</p>
          <div v-if="getMessageImages(item).length" class="chat-message__images">
            <img v-for="(imageUrl, imageIndex) in getMessageImages(item)" :key="`${index}-${imageIndex}`" :src="imageUrl" :alt="`Attachment ${imageIndex + 1}`" />
          </div>
        </div>
      </div>
    </div>

    <form class="chat-panel__composer" @submit.prevent="$emit('submit')">
      <div v-if="attachmentPreviewUrls.length" class="chat-panel__attachment-track">
        <img v-for="(previewUrl, previewIndex) in attachmentPreviewUrls" :key="`${previewUrl}-${previewIndex}`" :src="previewUrl" :alt="`Pending attachment ${previewIndex + 1}`" class="chat-panel__attachment-preview" />
      </div>
      <input :value="inputValue" type="text" placeholder="Write something..." @input="$emit('update:inputValue', ($event.target as HTMLInputElement).value)" />
      <LoadingButton
        :label="PaperclipIcon"
        @click="attachmentInput?.click()"
      />

      <LoadingButton type="submit" :label="SendIcon" :loading="sending" />
    </form>
  </section>
</template>

<style scoped lang="scss">
.chat-panel {
  flex: 3 1 32rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 0;
  max-height: 100%;
  min-width: 0;
  overflow: hidden;
  border-radius: 18px;
  background: $color-background-secondary;
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 1rem;
}

.chat-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-shrink: 0;
}

.chat-panel__header h2,
.chat-panel__header p {
  margin: 0;
}

.chat-panel__header h2 {
  font-family: 'Manrope';
  font-size: 1.25rem;
}

.chat-panel__header p {
  font-family: 'Nunito';
  font-size: 0.85rem;
  opacity: 0.7;
}

.chat-panel__price {
  font-family: 'Nunito';
  font-size: 0.85rem;
  font-weight: 600;
}

.chat-panel__messages {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-right: 0.25rem;
}

.chat-panel__empty {
  margin: auto 0;
  text-align: center;
  font-family: 'Nunito';
  color: rgba(15, 23, 42, 0.65);
}

.chat-message {
  max-width: min(100%, 420px);
  padding: 0.75rem;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-family: 'Nunito';
}

.chat-message--me {
  align-self: flex-end;
  background: rgba(58, 122, 254, 0.14);
}

.chat-message--other {
  align-self: flex-start;
  background: rgba(15, 23, 42, 0.06);
}

.chat-message__meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.chat-message__author {
  font-family: 'Manrope';
  font-weight: 700;
  font-size: 0.85rem;
  color: rgba(15, 23, 42, 0.78);
}

.chat-message__timestamp {
  font-family: 'Nunito';
  font-size: 0.75rem;
  color: rgba(15, 23, 42, 0.55);
}

.chat-message__body p {
  margin: 0;
  font-family: 'Nunito';
}

.chat-message__images {
  display: grid;
  gap: 0.5rem;
}

.chat-message__body img {
  width: 100%;
  border-radius: 12px;
  display: block;
}

.chat-panel__composer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  flex-shrink: 0;
}

.chat-panel__attachment-track {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.chat-panel__attachment-preview {
  width: 3rem;
  height: 3rem;
  flex: 0 0 3rem;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
}

.chat-panel__composer input[type='text'] {
  flex: 1 1 260px;
  min-width: 0;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 12px;
  padding: 0.75rem;
  font-family: 'Nunito';
}
</style>
