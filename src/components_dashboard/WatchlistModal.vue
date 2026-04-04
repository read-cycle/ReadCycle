<script setup lang="ts">
import AutocompleteInput from '../components/AutocompleteInput.vue';
import LoadingButton from '../components/LoadingButton.vue';
import type { useForm } from '../composables/useForm';

type PageForm = ReturnType<typeof useForm>;

defineEmits<{
  close: [];
  submit: [];
}>();

const props = defineProps<{
  open: boolean;
  form: PageForm;
  loading: boolean;
}>();

async function handleIsbnOptionSelect(isbn: string) {
  props.form.setField('isbn', isbn);
  delete props.form.errors.value.isbn;
  await props.form.runIsbnLookup();
}

function handleTitleOptionSelect(title: string) {
  props.form.setField('title', title);
  props.form.inferFromTitle();
}
</script>

<template>
  <div v-if="open" class="watchlist-modal">
    <div class="watchlist-modal__backdrop" @click="$emit('close')"></div>
    <div class="watchlist-modal__panel">
      <button type="button" class="watchlist-modal__close" @click="$emit('close')">Close</button>
      <h2>Add to watchlist</h2>
      <div class="watchlist-form">
        <section class="watchlist-form__section">
          <h3>Book details</h3>
          <label>
            <span class="field-label">
              ISBN
              <span class="field-help" tabindex="0" data-tooltip="Scan the barcode on the back of the book. ISBN means International Standard Book Number, usually a 10 or 13 digit book ID.">?</span>
            </span>
            <AutocompleteInput
              v-model="form.isbn.value"
              :options="form.isbnOptions"
              inputmode="numeric"
              enterkeyhint="next"
              spellcheck="false"
              autocapitalize="off"
              autocomplete="off"
              :class="{
                'is-valid': form.isbnValidity.value === true,
                'is-invalid': form.isbnValidity.value === false
              }"
              :valid="form.isbnValidity.value === true"
              :invalid="form.isbnValidity.value === false"
              @blur="form.runIsbnLookup"
              @option-select="handleIsbnOptionSelect"
            />
            <span
              v-if="form.isbnValidity.value !== null"
              class="isbn-indicator"
              :class="{
                'isbn-indicator--valid': form.isbnValidity.value === true,
                'isbn-indicator--invalid': form.isbnValidity.value === false
              }"
            >
              {{ form.isbnValidity.value ? 'Valid ISBN' : 'Invalid ISBN' }}
            </span>
          </label>
          <label>
            <span class="field-label">
              Title
              <span class="field-help" tabindex="0" data-tooltip="Enter the book title shown on the cover. Scanning a valid ISBN will usually fill this automatically.">?</span>
            </span>
            <AutocompleteInput
              v-model="form.title.value"
              :options="form.titleOptions"
              enterkeyhint="next"
              autocomplete="off"
              @input="form.dismissAutofill('title')"
              @blur="form.inferFromTitle"
              @option-select="handleTitleOptionSelect"
            />
          </label>
          <label>
            <span class="field-label">
              Grade
              <span class="field-help" tabindex="0" data-tooltip="Optional. Use this for the school grade or level the book is intended for, such as Grade 6 or Bridge Program.">?</span>
            </span>
            <input v-model="form.grade.value" list="dashboard-grade-options" @input="form.dismissAutofill('grade')" />
          </label>
          <datalist id="dashboard-grade-options">
            <option v-for="option in form.gradeOptions" :key="option" :value="option" />
          </datalist>
          <label>
            <span class="field-label">
              Subject
              <span class="field-help" tabindex="0" data-tooltip="Optional. This is the subject area of the book, such as English, Mathematics, or Biology.">?</span>
            </span>
            <input v-model="form.subject.value" list="dashboard-subject-options" @input="form.dismissAutofill('subject')" />
          </label>
          <datalist id="dashboard-subject-options">
            <option v-for="option in form.subjectOptions" :key="option" :value="option" />
          </datalist>
        </section>

        <section class="watchlist-form__section">
          <h3>Your details</h3>
          <label>
            Name
            <input v-model="form.name.value" />
          </label>
          <label>
            Quantity
            <input v-model.number="form.quantity.value" type="number" min="1" />
          </label>
        </section>
      </div>
      <LoadingButton label="Save to watchlist" :loading="loading" @click="$emit('submit')" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.watchlist-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.watchlist-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
}

.watchlist-modal__panel {
  position: relative;
  z-index: 1;
  width: min(100%, 760px);
  max-height: min(88dvh, 48rem);
  border-radius: 18px;
  background: $color-background;
  padding: clamp(1rem, 2.5vw, 1.5rem);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
}

.watchlist-modal__panel h2 {
  font-family: 'Manrope';
  font-size: clamp(1.2rem, 2.4vw, 1.5rem);
  margin: 0;
}

.watchlist-modal__close {
  align-self: flex-end;
  min-width: auto;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: clamp(0.95rem, 1.5vw, 1rem);
}

.watchlist-form {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.watchlist-form__section {
  flex: 1 1 280px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.watchlist-form__section h3 {
  font-family: 'Manrope';
  font-size: clamp(1rem, 1.8vw, 1.125rem);
}

.watchlist-form__section label {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-family: 'Nunito';
  font-size: clamp(0.95rem, 1.5vw, 1rem);
}

.field-label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.field-help {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
  color: $color-text;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: help;
}

.field-help::after {
  content: attr(data-tooltip);
  position: absolute;
  left: 50%;
  bottom: calc(100% + 0.55rem);
  transform: translateX(-50%);
  width: min(18rem, calc(100vw - 2rem));
  max-width: calc(100vw - 2rem);
  padding: 0.65rem 0.75rem;
  border-radius: 12px;
  background: #0f172a;
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1.35;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.22);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 160ms ease;
  z-index: 10;
}

.field-help:hover::after,
.field-help:focus-visible::after {
  opacity: 1;
  visibility: visible;
}

.watchlist-form__section input {
  width: 100%;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 12px;
  padding: 0.75rem;
  font-size: clamp(0.95rem, 1.5vw, 1rem);
}

.watchlist-form__section input.is-valid {
  border-color: #18cda6;
}

.watchlist-form__section input.is-invalid {
  border-color: #dc2626;
}

.isbn-indicator {
  font-size: 0.85rem;
}

.isbn-indicator--valid {
  color: #17826d;
}

.isbn-indicator--invalid {
  color: #dc2626;
}

@media (max-width: 640px) {
  .watchlist-modal {
    padding: 0.75rem;
    align-items: flex-end;
  }

  .watchlist-modal__panel {
    max-height: min(84dvh, 44rem);
    border-radius: 20px 20px 16px 16px;
  }

  :deep(.loading-button) {
    width: 100%;
  }

  .field-help::after {
    left: 0;
    right: auto;
    transform: none;
    width: min(16rem, calc(100vw - 1.5rem));
    max-width: calc(100vw - 1.5rem);
  }
}
</style>
