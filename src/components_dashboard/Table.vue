<script setup lang="ts">
import { computed } from 'vue';
import type { FirestoreRecord } from '../composables/firestore';
import type { UploadDoc, WatchlistDoc } from '../interfaces';
import SkeletonRow from '../components/SkeletonRow.vue';
import TableItem from './TableItem.vue';
import type { LucideIcon } from "lucide-vue-next";

const props = defineProps<{
  header?: string;
  icon?: LucideIcon;
  tableType?: string;
  loading: boolean;
  docs: Array<FirestoreRecord<UploadDoc> | FirestoreRecord<WatchlistDoc>>;
}>();

const emit = defineEmits<{
  'watchlist-click': [];
  delete: [string];
}>();

const emptyMessage = computed(() =>
  props.tableType === 'listings'
    ? "You haven't uploaded any books yet."
    : 'Your watchlist is empty.'
);
const SKELETON_ROWS = 3;
</script>

<template>
  <section class="dashboard-table">
    <header class="dashboard-table__header">
      <div class="dashboard-table__title">
        <div class="dashboard-table__icon">
          <component :is="icon" v-if="icon" />
        </div>
        <h3>{{ header }}</h3>
      </div>
      <button v-if="tableType === 'watchlist'" class="dashboard-table__add" type="button" @click="emit('watchlist-click')">
        Add watchlist
      </button>
    </header>

    <div v-if="loading" class="table table--loading">
      <SkeletonRow :rows="SKELETON_ROWS" />
    </div>

    <div v-else-if="!docs.length" class="dashboard-table__empty">
      {{ emptyMessage }}
    </div>

    <div v-else class="table">
      <div class="dashboard-table__scroll">
        <div class="table-item dashboard-table__labels">
          <div class="table-item__cell cell--thumb">Cover</div>
        <div class="table-item__cell cell--title">Title</div>
        <div class="table-item__cell">Grade</div>
        <div class="table-item__cell">Date</div>
        <div class="table-item__cell">Action</div>
      </div>
        <ul class="dashboard-table__list">
          <TableItem v-for="doc in docs" :key="doc[0]" :doc="doc" @delete="emit('delete', $event)" />
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.table-item__cell {
  flex: 1 1 0;
  min-width: 0;
  padding: 8px 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.cell--title {
  flex: 2 1 0;
}

.cell--thumb {
  flex: 0 0 72px;
}

.table-item__thumb {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: rgba(58, 122, 254, 0.08);
  background-size: cover;
  background-position: center;
}

.table-item__delete {
  min-width: auto;
  border: none;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
  padding: 0.625rem 0.75rem;
  cursor: pointer;
}

.dashboard-table {
  background: $color-background-secondary;
  border-radius: 18px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 0;
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.dashboard-table__header,
.dashboard-table__title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dashboard-table__header {
  min-height: 42px;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.dashboard-table__title h3 {
  margin: 0;
  font-family: Manrope;
}

.dashboard-table__icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.dashboard-table__add {
  min-width: auto;
  border: none;
  border-radius: 10px;
  padding: 0.625rem 0.875rem;
  background: $color-primary;
  color: $color-background;
  cursor: pointer;
}

.table {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  overflow-x: auto;
}

.dashboard-table__scroll {
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: min(30rem, 55vh);
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-gutter: stable;
}

.table--loading {
  justify-content: flex-start;
}

.dashboard-table__labels {
  color: rgba(15, 23, 42, 0.56);
  font-family: 'Manrope';
  display: flex;
  position: sticky;
  top: 0;
  z-index: 1;
  background: $color-background-secondary;
}

.dashboard-table__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.dashboard-table__empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 14px;
  background: rgba(58, 122, 254, 0.05);
  font-family: 'Nunito';
}

@media (max-width: 1024px) {
  .table {
    overflow-x: auto;
  }

  .dashboard-table__labels,
  .dashboard-table__list :deep(.table-item) {
    min-width: 600px;
  }

  .dashboard-table__scroll {
    max-height: min(26rem, 50vh);
  }
}

@media (min-width: 1025px) {
  .dashboard-table__scroll {
    max-height: calc(100dvh - 24rem);
  }
}
</style>
