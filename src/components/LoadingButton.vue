<script setup lang="ts">
import LoadingSpinner from './LoadingSpinner.vue';
import type {LucideIcon} from "lucide-vue-next";

withDefaults(defineProps<{
  label: string | LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}>(), {
  loading: false,
  disabled: false,
  type: 'button'
});
</script>

<template>
  <button class="loading-button" :class="{ 'is-loading': loading }" :type="type" :disabled="disabled || loading">
    <LoadingSpinner v-if="loading" />
    <span v-else-if="typeof label === 'string'">{{ label }}</span>
    <component v-else :is="label" style="color: white; padding: 0;"></component>
  </button>
</template>

<style scoped lang="scss">
.loading-button {
  min-height: 44px;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  background: $color-primary-darkened;
  color: $color-text-secondary;
  font-family: 'Manrope';
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.loading-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.loading-button:disabled,
.loading-button.is-loading {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
