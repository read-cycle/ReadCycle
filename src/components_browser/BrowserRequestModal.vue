<script setup lang="ts">
import { computed } from 'vue';
import LoadingButton from '../components/LoadingButton.vue';
import type { FirestoreRecord } from '../composables/firestore';
import type { useForm } from '../composables/useForm';
import type { UploadDoc } from '../interfaces';

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
          <img v-if="props.item[1].listingImage" class="browser-modal__image" :src="props.item[1].listingImage" alt="Book cover" />
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
}

.browser-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
}

.browser-modal__panel {
  position: relative;
  z-index: 1;
  width: min(100% - 2rem, 900px);
  margin: 4vh auto 0;
  border-radius: 18px;
  background: $color-background;
  padding: 1.25rem;
}

.browser-modal__close {
  min-width: auto;
  border: none;
  background: transparent;
  cursor: pointer;
  margin-left: auto;
  display: block;
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
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.browser-modal__details p {
  font-family: 'Nunito';
  font-size: 1rem;
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
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.browser-modal__section label {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-family: 'Nunito';
}

.browser-modal__section input {
  width: 100%;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 12px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
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
}
</style>
