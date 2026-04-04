<script setup lang="ts">
import LoadingButton from '../components/LoadingButton.vue';

defineProps<{
  open: boolean;
  dontShowAgain: boolean;
  actionLoading?: boolean;
}>();

defineEmits<{
  close: [];
  confirm: [];
  'update:dontShowAgain': [value: boolean];
}>();
</script>

<template>
  <div v-if="open" class="isbn-modal">
    <div class="isbn-modal__backdrop" @click="$emit('close')"></div>
    <div class="isbn-modal__panel">
      <button class="isbn-modal__close" type="button" @click="$emit('close')">Close</button>
      <h2>ISBN recommended</h2>
      <div class="isbn-modal__content">
        <p>Adding an ISBN helps ReadCycle identify the exact book, improve metadata lookup, and increase trust for potential requesters.</p>
        <p>You can continue without one, but listings with ISBNs usually have better matching and acceptance chances.</p>
      </div>

      <label class="isbn-modal__checkbox">
        <input :checked="dontShowAgain" type="checkbox" @change="$emit('update:dontShowAgain', ($event.target as HTMLInputElement).checked)" />
        <span>Don't show this again</span>
      </label>

      <div class="isbn-modal__actions">
        <button type="button" class="isbn-modal__secondary" @click="$emit('close')">Go back</button>
        <LoadingButton label="Continue without ISBN" :loading="actionLoading" @click="$emit('confirm')" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.isbn-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.isbn-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
}

.isbn-modal__panel {
  position: relative;
  z-index: 1;
  width: min(100%, 520px);
  border-radius: 18px;
  background: $color-background;
  color: $color-text;
  padding: clamp(1rem, 2.4vw, 1.5rem);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
}

.isbn-modal__close {
  align-self: flex-end;
  border: none;
  background: transparent;
  color: $color-accent;
  cursor: pointer;
  min-width: auto;
}

.isbn-modal__panel h2 {
  margin: 0;
  font-family: 'Manrope';
}

.isbn-modal__content {
  display: grid;
  gap: 0.75rem;
  font-family: 'Nunito';
}

.isbn-modal__content p {
  margin: 0;
}

.isbn-modal__checkbox {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: 'Nunito';
}

.isbn-modal__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.isbn-modal__secondary {
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: transparent;
  padding: 0.75rem 1rem;
  font-family: 'Manrope';
  font-weight: 700;
  cursor: pointer;
}

.isbn-modal__actions :deep(.loading-button),
.isbn-modal__secondary {
  flex: 1 1 200px;
}

@media (max-width: 640px) {
  .isbn-modal__actions {
    flex-direction: column;
  }
}
</style>
