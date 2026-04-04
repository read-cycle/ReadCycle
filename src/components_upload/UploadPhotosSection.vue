<script setup lang="ts">
import ImageUploader from './ImageUploader.vue';

const props = defineProps<{
  listingImageName: string;
  extraImagesCount: number;
}>();

const emit = defineEmits<{
  (e: 'listing-image-change', value: File | null): void;
  (e: 'extra-images-change', value: File[]): void;
}>();

function handleListingImage(value: File | null) {
  emit('listing-image-change', value);
}

function handleExtraImages(value: File[] | null) {
  emit('extra-images-change', value ?? []);
}
</script>

<template>
  <section class="upload-form__section">
    <h2>Photos</h2>
    <div class="uploader-grid">
      <div class="uploader-card">
        <div class="uploader-card__header">
          <h3>
            Listing image
            <span class="field-indicator field-indicator--required">Required</span>
          </h3>
          <span v-if="listingImageName" class="caption caption--filename" :title="listingImageName">{{ listingImageName }}</span>
        </div>
        <ImageUploader :multiple="false" @update:modelValue="handleListingImage" />
      </div>

      <div class="uploader-card">
        <div class="uploader-card__header">
          <h3>
            Extra images
            <span class="field-indicator field-indicator--optional">Optional</span>
          </h3>
          <span v-if="extraImagesCount" class="caption">{{ extraImagesCount }} selected</span>
        </div>
        <ImageUploader :multiple="true" @update:modelValue="handleExtraImages" />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.upload-form__section {
  border-radius: 18px;
  padding: 1.25rem;
  background: $color-background-secondary;
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.upload-form__section h2 {
  font-family: 'Manrope';
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.uploader-grid {
  display: grid;
  gap: 1rem;
}

.uploader-card {
  border-radius: 16px;
  padding: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.65);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
  display: grid;
  min-height: 280px;
}

.uploader-card__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  height: fit-content;
  min-width: 0;
}

.uploader-card__header h3 {
  margin: 0;
  font-family: 'Manrope';
  font-size: 1.1rem;
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  flex-shrink: 0;
}

.field-indicator {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.15rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.2;
  font-family: 'Nunito';
}

.field-indicator--required {
  background: rgba(34, 197, 94, 0.14);
  color: #166534;
}

.field-indicator--optional {
  background: rgba(15, 23, 42, 0.08);
  color: $color-text-secondary;
}

.caption {
  font-family: 'Nunito';
  font-size: 0.9rem;
  color: $color-text-secondary;
}

.caption--filename {
  min-width: 0;
  max-width: min(55%, 18rem);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}

@media (max-width: 640px) {
  .caption--filename {
    max-width: min(50vw, 12rem);
  }
}

.uploader-card ImageUploader {
  width: 100%;
  min-height: 220px;
}

@media (max-width: 640px) {
  .uploader-grid {
    grid-template-columns: 1fr;
  }

  .uploader-card {
    min-height: auto;
  }
}

@media (min-width: 768px) {
  .uploader-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
