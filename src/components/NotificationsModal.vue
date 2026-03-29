<script setup lang="ts">
import LoadingButton from './LoadingButton.vue';
import type { RequestNotificationItem } from '../composables/useRequestNotifications';

defineProps<{
  open: boolean;
  item: RequestNotificationItem | null;
  actionLoading?: boolean;
}>();

defineEmits<{
  close: [];
  accept: [];
  deny: [];
}>();
</script>

<template>
  <div v-if="open && item" class="notifications-modal">
    <div class="notifications-modal__backdrop" @click="$emit('close')"></div>
    <div class="notifications-modal__panel">
      <button class="notifications-modal__close" type="button" @click="$emit('close')">Close</button>
      <h2>Book request</h2>
      <div class="notifications-modal__content">
        <p><b>Title:</b> {{ item[1].title || 'Unknown title' }}</p>
        <p><b>Grade:</b> {{ item[1].grade || 'Unknown grade' }}</p>
        <p><b>Requester:</b> {{ item[1].buyerName || 'Unknown requester' }}</p>
        <p><b>Quantity:</b> {{ item[1].buyerQuantity ?? 0 }}</p>
      </div>
      <div class="notifications-modal__actions">
        <LoadingButton label="Accept" :loading="actionLoading" @click="$emit('accept')" />
        <LoadingButton label="Deny" :loading="actionLoading" @click="$emit('deny')" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.notifications-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.notifications-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
}

.notifications-modal__panel {
  position: relative;
  z-index: 1;
  width: min(100% - 2rem, 520px);
  margin: 5vh auto 0;
  border-radius: 18px;
  background: $color-background;
  color: $color-text;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notifications-modal__close {
  align-self: flex-end;
  border: none;
  background: transparent;
  color: $color-accent;
  cursor: pointer;
  min-width: auto;
}

.notifications-modal__content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-family: 'Nunito';
}

.notifications-modal__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.notifications-modal__actions :deep(.loading-button) {
  flex: 1 1 180px;
}
</style>
