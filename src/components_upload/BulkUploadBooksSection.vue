<script setup lang="ts">
import type { BulkUploadBookItem } from '../composables/useBulkUploadPage';
import ImageUploader from './ImageUploader.vue';

const props = defineProps<{
  books: BulkUploadBookItem[];
  remainingBooks: BulkUploadBookItem[];
  selectedBookToAdd: string;
  bookErrors: Record<string, string>;
}>();

const emit = defineEmits<{
  (e: 'update:selectedBookToAdd', value: string): void;
  (e: 'add-book'): void;
  (e: 'remove-book', bookId: string): void;
  (e: 'set-book-image', payload: { bookId: string; file: File | null; }): void;
  (e: 'update-book-field', payload: { bookId: string; field: 'price' | 'quantity'; value: number; }): void;
}>();

function handleSelectedBookChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  emit('update:selectedBookToAdd', target.value);
}

function handleBookImage(bookId: string, value: File | File[] | null) {
  const file = Array.isArray(value) ? value[0] ?? null : value;
  emit('set-book-image', { bookId, file });
}

function handleBookFieldInput(bookId: string, field: 'price' | 'quantity', event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update-book-field', { bookId, field, value: Number(target.value) });
}
</script>

<template>
  <section class="upload-form__section">
    <div class="bulk-books__header">
      <div>
        <h2>Books in this batch</h2>
        <p>Each selected book needs its own listing image before submission.</p>
      </div>
      <span class="bulk-books__count">{{ books.length }} selected</span>
    </div>

    <div class="bulk-books__toolbar">
      <select :value="selectedBookToAdd" :disabled="!remainingBooks.length" @change="handleSelectedBookChange">
        <option value="">Select a removed book to add back</option>
        <option v-for="book in remainingBooks" :key="book.id" :value="book.id">
          {{ book.title }}
        </option>
      </select>
      <button type="button" :disabled="!selectedBookToAdd" @click="emit('add-book')">
        Add book
      </button>
    </div>

    <div v-if="books.length" class="bulk-books__grid">
      <article v-for="book in books" :key="book.id" class="bulk-book-card">
        <div class="bulk-book-card__meta">
          <div>
            <h3>{{ book.title }}</h3>
            <p>ISBN {{ book.isbn }}</p>
            <p v-if="book.subject">{{ book.subject }}</p>
          </div>
          <div class="bulk-book-card__meta-actions">
            <button type="button" class="bulk-book-card__remove" :disabled="book.status === 'success' || book.status === 'uploading'" @click="emit('remove-book', book.id)">
              Remove
            </button>
          </div>
        </div>

        <div class="bulk-book-card__status">
          <span v-if="book.listingImage" class="bulk-book-card__filename" :title="book.listingImage.name">
            {{ book.listingImage.name }}
          </span>
          <span v-else>No image selected</span>
        </div>

        <div class="bulk-book-card__fields">
          <label>
            Price
            <input :value="book.price" :disabled="book.status === 'success' || book.status === 'uploading'" type="number" min="0" @input="handleBookFieldInput(book.id, 'price', $event)" />
          </label>
          <label>
            Quantity
            <input :value="book.quantity" :disabled="book.status === 'success' || book.status === 'uploading'" type="number" min="1" @input="handleBookFieldInput(book.id, 'quantity', $event)" />
          </label>
        </div>

        <div class="bulk-book-card__uploader">
          <ImageUploader v-if="book.status !== 'success'" :multiple="false" @update:modelValue="handleBookImage(book.id, $event)" />
          <div v-else class="bulk-book-card__uploaded-note">This book was uploaded successfully and will not be submitted again.</div>
        </div>

        <p v-if="props.bookErrors[book.id]" class="bulk-book-card__error">{{ props.bookErrors[book.id] }}</p>
        <p v-else-if="book.error" class="bulk-book-card__error">{{ book.error }}</p>
      </article>
    </div>

    <div v-else class="bulk-books__empty">
      Choose a school and grade to load books, or add a removed book back into the batch.
    </div>
  </section>
</template>

<style scoped lang="scss">
.upload-form__section {
  border-radius: 18px;
  padding: 1rem;
  background: $color-background-secondary;
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.bulk-books__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.bulk-books__header h2 {
  margin: 0 0 0.25rem;
  font-family: 'Manrope';
  font-size: 1.5rem;
  font-weight: 600;
}

.bulk-books__header p,
.bulk-books__count,
.bulk-book-card__meta p,
.bulk-book-card__status,
.bulk-books__empty {
  font-family: 'Nunito';
  color: $color-text-secondary;
}

.bulk-books__count {
  white-space: nowrap;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
}

.bulk-books__toolbar {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.bulk-books__toolbar select,
.bulk-books__toolbar button {
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  padding: 0.75rem 0.9rem;
  font-family: 'Nunito';
}

.bulk-books__toolbar select {
  flex: 1 1 auto;
  background: white;
}

.bulk-books__toolbar button {
  background: $color-accent;
  color: white;
  cursor: pointer;
}

.bulk-books__toolbar button:disabled,
.bulk-books__toolbar select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.bulk-books__grid {
  display: grid;
  gap: 1rem;
}

.bulk-book-card {
  display: grid;
  gap: 0.9rem;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 16px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.78);
}

.bulk-book-card__meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.bulk-book-card__meta-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.bulk-book-card__meta h3 {
  margin: 0 0 0.35rem;
  font-family: 'Manrope';
}

.bulk-book-card__meta p {
  margin: 0.15rem 0 0;
}

.bulk-book-card__remove {
  border: none;
  background: transparent;
  color: #dc2626;
  font-family: 'Nunito';
  font-weight: 700;
  cursor: pointer;
}

.bulk-book-card__remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bulk-book-card__status {
  min-width: 0;
}

.bulk-book-card__filename {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bulk-book-card__uploader {
  min-height: 220px;
}

.bulk-book-card__uploaded-note {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem;
  border: 2px dashed rgba(34, 197, 94, 0.28);
  border-radius: 16px;
  background: rgba(34, 197, 94, 0.08);
  font-family: 'Nunito';
  color: #166534;
}

.bulk-book-card__fields {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.bulk-book-card__fields label {
  display: grid;
  gap: 0.35rem;
  font-family: 'Nunito';
}

.bulk-book-card__fields input {
  width: 100%;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 12px;
  padding: 0.75rem;
}

.bulk-book-card__fields input:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.bulk-book-card__error {
  margin: 0;
  font-family: 'Nunito';
  color: #dc2626;
}

.bulk-books__empty {
  padding: 1rem;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.04);
}

@media (min-width: 900px) {
  .bulk-books__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .bulk-books__header,
  .bulk-books__toolbar,
  .bulk-book-card__meta,
  .bulk-book-card__meta-actions {
    flex-direction: column;
  }

  .bulk-books__count {
    align-self: flex-start;
  }

  .bulk-book-card__fields {
    grid-template-columns: 1fr;
  }
}
</style>
