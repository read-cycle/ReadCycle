<script setup lang="ts">
import { Timestamp, type DocumentReference } from 'firebase/firestore';
import type { UploadDoc, WatchlistDoc } from '../interfaces';

const props = defineProps<{
  doc: [DocumentReference, UploadDoc | WatchlistDoc];
}>();

const emit = defineEmits<{
  delete: [DocumentReference];
}>();

function formatTimestamp(timestamp?: Timestamp) {
  if (!timestamp) return '';
  return timestamp.toDate().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function getListingImage(docData: UploadDoc | WatchlistDoc) {
  return 'listingImage' in docData ? docData.listingImage : '';
}
</script>

<template>
  <li class="table-item">
    <div class="table-item__cell cell--thumb">
      <div
        class="table-item__thumb"
        :style="getListingImage(props.doc[1]) ? { backgroundImage: `url(${getListingImage(props.doc[1])})` } : undefined"
      ></div>
    </div>

    <div class="table-item__cell table-item__cell-content cell--title">
      {{ props.doc[1].title || 'Untitled' }}
    </div>

    <div class="table-item__cell table-item__cell-content">
      {{ props.doc[1].grade || 'No grade' }}
    </div>

    <div class="table-item__cell table-item__cell-content">
      {{ formatTimestamp(props.doc[1].timestamp) }}
    </div>

    <div class="table-item__cell">
      <button
        class="table-item__delete"
        type="button"
        @click="emit('delete', props.doc[0])"
      >
        Remove
      </button>
    </div>
  </li>
</template>

<style scoped lang="scss">
.table-item {
  display: flex;
  flex-direction: row;
  height: 64px;
  width: 100%;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.table-item__cell {
  flex: 1 1 0;
  min-width: 0;
  padding: 8px 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.table-item__cell-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Nunito';
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
</style>
