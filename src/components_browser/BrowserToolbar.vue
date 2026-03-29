<script setup lang="ts">
defineProps<{
  modelValue: string;
}>();

defineEmits<{
  'update:modelValue': [string];
}>();
</script>

<template>
  <section class="browser-toolbar">
    <label class="browser-search">
      Search
      <input :value="modelValue" type="text" placeholder="Search by title, grade, or subject" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
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
</style>
