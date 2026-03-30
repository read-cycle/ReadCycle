<script setup lang="ts">
import type { FirestoreRecord } from '../composables/firestore';
import type { BuyerRequestedDoc } from '../interfaces';
import TableItem from './TableItem.vue';

defineProps<{
  header: string;
  docs: FirestoreRecord<BuyerRequestedDoc>[];
  uploader: boolean;
}>();

defineEmits<{
  select: [FirestoreRecord<BuyerRequestedDoc>];
}>();
</script>

<template>
  <div class="chat-list">
    <h3>{{ header }}</h3>
    <TableItem v-for="doc in docs" :key="doc[0].id" :uploader="uploader" :doc-data="doc" @click="$emit('select', doc)" />
  </div>
</template>

<style scoped lang="scss">
.chat-list {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
}

.chat-list h3 {
  margin: 0 0 0.75rem;
  font-family: 'Manrope';
  font-size: 1rem;
}

@media (max-width: 640px) {
  .chat-list {
    padding: 0.75rem;
  }

  .chat-list h3 {
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
  }
}
</style>
