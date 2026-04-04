<script setup lang="ts">
defineProps<{
  modelValue: string;
  disabled?: boolean;
}>();

defineEmits<{
  'update:modelValue': [string];
}>();
</script>

<template>
  <section class="browser-toolbar">
    <label class="browser-search">
      Search
      <input :value="modelValue" :disabled="disabled" type="text" :placeholder="disabled ? 'Loading books...' : 'Search by title, grade, or subject'" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
    </label>
  </section>
</template>

<style scoped lang="scss">
.browser-toolbar {
  display: flex;
}

.browser-search {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-family: 'Nunito';
}

.browser-search input {
  width: 100%;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 12px;
  padding: 0.75rem;
}

.browser-search input:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
