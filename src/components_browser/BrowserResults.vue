<script setup lang="ts">
import SkeletonRow from '../components/SkeletonRow.vue';
import type { FirestoreRecord } from '../composables/firestore';
import type { UploadDoc } from '../interfaces';
import BrowserCard from './BrowserCard.vue';

defineProps<{
  loading: boolean;
  docs: FirestoreRecord<UploadDoc>[];
}>();

defineEmits<{
  select: [FirestoreRecord<UploadDoc>];
}>();
</script>

<template>
  <section v-if="loading" class="browser-results-flex">
    <SkeletonRow :rows="3" />
  </section>

  <section v-else-if="!docs.length" class="browser-empty">
    No books match your search. 🔍
  </section>

  <section v-else class="browser-results">
    <BrowserCard v-for="docData in docs" :key="docData[0].id" :data="docData[1]" @click="$emit('select', docData)" />
  </section>
</template>

<style scoped lang="scss">
.browser-results-flex {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.browser-results {
  display: grid;
  grid-template-columns: repeat(auto-fill, 320px);
  grid-template-rows: repeat(auto-fill, 320px);
  gap: 1rem;
}

.browser-results :deep(.browsercard-container) {
  flex: 1 1 280px;
}

.browser-empty {
  min-height: 180px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(58, 122, 254, 0.05);
  text-align: center;
  font-family: 'Nunito';
}
</style>
