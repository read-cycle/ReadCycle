<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import AppImage from '../components/AppImage.vue';
import LoadingButton from '../components/LoadingButton.vue';
import type { FirestoreRecord } from '../composables/firestore';
import type { useForm } from '../composables/useForm';
import type { UploadDoc } from '../interfaces';
import { getDisplayImageUrl } from '../utils/imageUrls';

type PageForm = ReturnType<typeof useForm>;

defineEmits<{
  close: [];
  submit: [];
}>();

const props = defineProps<{
  open: boolean;
  item: FirestoreRecord<UploadDoc> | null;
  requestForm: PageForm;
  submitLoading: boolean;
}>();

const maxAvailableQuantity = computed(() => Math.max(props.item?.[1].quantity ?? 1, 1));
const activeImageIndex = ref(0);

const modalImages = computed(() => {
  const item = props.item?.[1];
  if (!item) return [];

  return [
    {
      thumbUrl: getDisplayImageUrl(item.listingImageThumb, item.listingImage),
      fullUrl: item.listingImage
    },
    ...(item.extraImages || []).map((imageUrl, index) => ({
      thumbUrl: getDisplayImageUrl(item.extraImageThumbs?.[index], imageUrl),
      fullUrl: imageUrl
    }))
  ].filter((image) => Boolean(image.thumbUrl));
});

const activeImage = computed(() => modalImages.value[activeImageIndex.value] || null);

watch(
  () => props.item?.[0],
  () => {
    activeImageIndex.value = 0;
  }
);

function showPreviousImage() {
  if (!modalImages.value.length) return;
  activeImageIndex.value =
    (activeImageIndex.value - 1 + modalImages.value.length) % modalImages.value.length;
}

function showNextImage() {
  if (!modalImages.value.length) return;
  activeImageIndex.value = (activeImageIndex.value + 1) % modalImages.value.length;
}
</script>

<template>
  <div v-if="props.open && props.item" class="browser-modal">
    <div class="browser-modal__backdrop" @click="$emit('close')"></div>
    <div class="browser-modal__panel">
      <button type="button" class="browser-modal__close" @click="$emit('close')">Close</button>
      <div class="browser-modal__body">
        <section class="browser-modal__details">
          <h2>{{ props.item[1].title || 'Untitled' }}</h2>
          <div class="browser-modal__detail-grid">
            <p><strong>Grade:</strong> {{ props.item[1].grade || 'No grade' }}</p>
            <p><strong>Subject:</strong> {{ props.item[1].subject || 'No subject' }}</p>
            <p><strong>Available:</strong> {{ props.item[1].quantity ?? 0 }}</p>
            <p><strong>Price:</strong> ₹{{ props.item[1].price ?? 0 }}</p>
            <p><strong>Uploader:</strong> {{ props.item[1].uploaderName || 'Unknown' }}</p>
            <p><strong>ISBN:</strong> {{ props.item[1].isbn || 'Not provided' }}</p>
          </div>

          <div v-if="activeImage" class="browser-modal__gallery">
            <a :href="activeImage.fullUrl" target="_blank" rel="noopener noreferrer" class="browser-modal__image-link">
              <AppImage class="browser-modal__image" :src="activeImage.thumbUrl" alt="Book photo" eager />
            </a>

            <div v-if="modalImages.length > 1" class="browser-modal__gallery-controls">
              <button type="button" class="browser-modal__gallery-btn" @click="showPreviousImage">
                ‹
              </button>
              <p class="browser-modal__gallery-count">
                {{ activeImageIndex + 1 }} / {{ modalImages.length }}
              </p>
              <button type="button" class="browser-modal__gallery-btn" @click="showNextImage">
                ›
              </button>
            </div>
          </div>
        </section>

        <form class="browser-modal__form" @submit.prevent="$emit('submit')">
          <section class="browser-modal__section">
            <h3>Request details</h3>
            <label>
              Your name
              <input v-model="props.requestForm.name.value" />
            </label>
            <label>
              Quantity
              <input v-model.number="props.requestForm.quantity.value" type="number" min="1" :max="maxAvailableQuantity" />
            </label>
            <p class="browser-modal__hint">Choose between 1 and {{ maxAvailableQuantity }}.</p>
          </section>
          <LoadingButton type="submit" label="Send request" :loading="props.submitLoading" />
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.browser-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.browser-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
}

.browser-modal__panel {
  position: relative;
  z-index: 1;
  width: min(100%, 900px);
  max-height: min(88dvh, 50rem);
  border-radius: 18px;
  background: $color-background;
  padding: clamp(1rem, 2.5vw, 1.5rem);
  overflow-y: auto;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
}

.browser-modal__close {
  min-width: auto;
  border: none;
  background: transparent;
  cursor: pointer;
  margin-left: auto;
  display: block;
  font-size: clamp(0.95rem, 1.5vw, 1rem);
}

.browser-modal__body {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.browser-modal__details,
.browser-modal__form {
  flex: 1 1 280px;
}

.browser-modal__details h2 {
  font-family: 'Manrope';
  font-size: clamp(1.2rem, 2.6vw, 1.5rem);
  margin-bottom: 0.5rem;
}

.browser-modal__details p {
  font-family: 'Nunito';
  font-size: clamp(0.95rem, 1.6vw, 1rem);
}

.browser-modal__detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.5rem 1rem;
}

.browser-modal__detail-grid p {
  margin: 0;
}

.browser-modal__section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.browser-modal__section h3 {
  font-family: 'Manrope';
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  margin-bottom: 0.5rem;
}

.browser-modal__section label {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-family: 'Nunito';
  font-size: clamp(0.95rem, 1.5vw, 1rem);
}

.browser-modal__section input {
  width: 100%;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 12px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  font-size: clamp(0.95rem, 1.5vw, 1rem);
}

.browser-modal__hint {
  margin: 0;
  font-family: 'Nunito';
  font-size: 0.9rem;
  color: rgba(15, 23, 42, 0.65);
}

.browser-modal__image {
  width: 100%;
  margin-top: 1rem;
  border-radius: 18px;
  object-fit: cover;
  aspect-ratio: 4 / 3;
}

.browser-modal__gallery {
  margin-top: 1rem;
}

.browser-modal__image-link {
  display: block;
}

.browser-modal__gallery-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.browser-modal__gallery-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 999px;
  background: rgba(58, 122, 254, 0.08);
  color: $color-accent;
  font-size: 1.3rem;
  line-height: 1;
  cursor: pointer;
}

.browser-modal__gallery-count {
  margin: 0;
  font-family: 'Nunito';
  font-size: 0.95rem;
  color: rgba(15, 23, 42, 0.7);
}

@media (max-width: 640px) {
  .browser-modal {
    padding: 0.75rem;
  }

  .browser-modal__panel {
    max-height: min(84dvh, 44rem);
    border-radius: 20px 20px 16px 16px;
  }

  .browser-modal__body {
    gap: 1.25rem;
  }

  .browser-modal__detail-grid {
    grid-template-columns: 1fr;
  }

  .browser-modal__form :deep(.loading-button) {
    width: 100%;
  }
}
</style>
