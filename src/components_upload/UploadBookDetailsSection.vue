<script setup lang="ts">
import AutocompleteInput from '../components/AutocompleteInput.vue';
import ISBNScanner from '../components/ISBNScanner.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import type { useForm } from '../composables/useForm';

type PageForm = ReturnType<typeof useForm>;

const props = defineProps<{
  form: PageForm;
}>();

async function handleIsbnDetected(isbn: string) {
  props.form.setField('isbn', isbn);
  delete props.form.errors.value.isbn;
  await props.form.runIsbnLookup();
}

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
  <section class="upload-form__section">
    <h2>Book details</h2>
    <div class="upload-form__fields">
      <label>
        <span class="field-label">
          ISBN
          <span class="field-indicator field-indicator--optional">Optional</span>
          <span class="field-help" tabindex="0" data-tooltip="Scan the barcode on the back of the book. ISBN means International Standard Book Number, usually a 10 or 13 digit book ID.">?</span>
        </span>
        <div class="isbn-field-row">
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
          <ISBNScanner class="isbn-field-row__scanner" @detected="handleIsbnDetected" />
        </div>
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
          <span class="field-indicator field-indicator--required">Required</span>
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

      <div v-if="form.isbnLookupLoading.value" class="upload-form__lookup">
        <LoadingSpinner />
        <span>Fetching book details...</span>
      </div>

      <label>
        <span class="field-label">
          Grade
          <span class="field-indicator field-indicator--optional">Optional</span>
          <span class="field-help" tabindex="0" data-tooltip="Optional. Use this for the school grade or level the book is intended for, such as Grade 6 or Bridge Program.">?</span>
        </span>
        <input v-model="form.grade.value" list="upload-grade-options" @input="form.dismissAutofill('grade')" />
      </label>
      <datalist id="upload-grade-options">
        <option v-for="option in form.gradeOptions" :key="option" :value="option" />
      </datalist>

      <label>
        <span class="field-label">
          Subject
          <span class="field-indicator field-indicator--optional">Optional</span>
          <span class="field-help" tabindex="0" data-tooltip="Optional. This is the subject area of the book, such as English, Mathematics, or Biology.">?</span>
        </span>
        <input v-model="form.subject.value" list="upload-subject-options" @input="form.dismissAutofill('subject')" />
      </label>
      <datalist id="upload-subject-options">
        <option v-for="option in form.subjectOptions" :key="option" :value="option" />
      </datalist>
    </div>
  </section>
</template>

<style scoped lang="scss">
.upload-form__section {
  border-radius: 18px;
  padding: 1rem;
  background: $color-background-secondary;
  border: 1px solid rgba(15, 23, 42, 0.08);
  overflow: visible;
}

.upload-form__fields {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  overflow: visible;
}

.upload-form__section h2 {
  font-family: 'Manrope';
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.upload-form__fields label {
  flex: 1 1 280px;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-family: 'Nunito';
}

.upload-form__fields input {
  width: 100%;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 12px;
  padding: 0.75rem;
}

.field-label {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.field-indicator {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.15rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.2;
}

.field-indicator--required {
  background: rgba(34, 197, 94, 0.14);
  color: #166534;
}

.field-indicator--optional {
  background: rgba(15, 23, 42, 0.08);
  color: $color-text-secondary;
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
  z-index: 8;
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

.isbn-field-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.isbn-field-row :deep(.autocomplete-input) {
  flex: 1 1 auto;
}

.isbn-field-row__scanner {
  flex: 0 0 auto;
}

.upload-form__fields input.is-valid {
  border-color: #18cda6;
}

.upload-form__fields input.is-invalid {
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

.upload-form__lookup {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: $color-background-secondary;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Nunito';
  z-index: 25;
}

.autofill-badge button {
  min-width: auto;
  border: none;
  background: transparent;
  color: $color-primary;
  cursor: pointer;
}

@media (max-width: 720px) {
  .isbn-field-row {
    flex-direction: column;
  }

  .isbn-field-row__scanner {
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
