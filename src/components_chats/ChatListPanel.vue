<script setup lang="ts">
import type { FirestoreRecord } from '../composables/firestore';
import type { MatchedChatDoc } from '../interfaces';
import TableItem from './TableItem.vue';

defineProps<{
  header: string;
  docs: FirestoreRecord<MatchedChatDoc>[];
  uploader: boolean;
}>();

defineEmits<{
  select: [FirestoreRecord<MatchedChatDoc>];
}>();
</script>

<template>
  <div class="chat-list">
    <h3>{{ header }}</h3>
    <TableItem v-for="doc in docs" :key="doc[0]" :uploader="uploader" :doc-data="doc" @click="$emit('select', doc)" />
  </div>
</template>

<style scoped lang="scss">
.chat-list {
  width: 100%;
  max-width: 100%;
  max-width: 100vw;
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  overflow-x: hidden;
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
