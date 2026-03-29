<script setup lang="ts">
import LoadingSpinner from '../components/LoadingSpinner.vue';
import type { useForm } from '../composables/useForm';

type PageForm = ReturnType<typeof useForm>;

defineProps<{
  form: PageForm;
}>();
</script>

<template>
  <section class="upload-form__section">
    <h2>Book details</h2>
    <div class="upload-form__fields">
      <label>
        ISBN
        <input v-model="form.isbn.value" list="upload-isbn-options" @blur="form.runIsbnLookup" />
      </label>
      <datalist id="upload-isbn-options">
        <option v-for="option in form.isbnOptions" :key="option" :value="option" />
      </datalist>

      <label>
        Title
        <input v-model="form.title.value" list="upload-title-options" @blur="form.inferFromTitle" />
      </label>
      <datalist id="upload-title-options">
        <option v-for="option in form.titleOptions" :key="option" :value="option" />
      </datalist>

      <div v-if="form.isbnLookupLoading.value" class="upload-form__lookup">
        <LoadingSpinner />
        <span>Fetching book details...</span>
      </div>

      <label>
        Grade
        <input v-model="form.grade.value" list="upload-grade-options" @input="form.dismissAutofill('grade')" />
      </label>
      <datalist id="upload-grade-options">
        <option v-for="option in form.gradeOptions" :key="option" :value="option" />
      </datalist>

      <label>
        Subject
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
  overflow: hidden;
}

.upload-form__fields {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
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
}

.autofill-badge button {
  min-width: auto;
  border: none;
  background: transparent;
  color: $color-primary;
  cursor: pointer;
}
</style>
