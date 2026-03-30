<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import SkeletonRow from '../components/SkeletonRow.vue';
import type { FirestoreRecord } from '../composables/firestore';
import type { UploadDoc } from '../interfaces';
import BrowserCard from './BrowserCard.vue';

const props = defineProps<{
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  docs: FirestoreRecord<UploadDoc>[];
}>();

const emit = defineEmits<{
  select: [FirestoreRecord<UploadDoc>];
  'load-more': [];
}>();

const loadMoreRef = ref<HTMLElement | null>(null);

let observer: IntersectionObserver | null = null;

function bindObserver() {
  observer?.disconnect();

  if (!loadMoreRef.value || props.loading || !props.hasMore) return;

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        emit('load-more');
      }
    },
    {
      root: null,
      rootMargin: '0px 0px 320px 0px',
      threshold: 0.05
    }
  );

  observer.observe(loadMoreRef.value);
}

onMounted(bindObserver);

watch(() => [props.loading, props.hasMore, props.docs.length], bindObserver);

onBeforeUnmount(() => {
  observer?.disconnect();
});
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

  <div v-if="!loading && hasMore" ref="loadMoreRef" class="browser-load-more">
    <span v-if="loadingMore">Loading more books...</span>
  </div>
</template>

<style scoped lang="scss">
.browser-results-flex {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.browser-results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 320px));
  grid-auto-rows: 320px;
  gap: 1rem;
  justify-content: center;
}

.browser-results :deep(.browsercard-container) {
  height: 100%;
}

@media (max-width: 640px) {
  .browser-results {
    grid-template-columns: minmax(0, 1fr);
    grid-auto-rows: 320px;
  }
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

.browser-load-more {
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(18, 32, 53, 0.72);
  font-family: 'Nunito';
  font-size: 0.95rem;
}
</style>
