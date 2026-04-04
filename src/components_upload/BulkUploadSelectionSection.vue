<script setup lang="ts">
import type { useBulkUploadForm } from '../composables/useBulkUploadForm';

type BulkForm = ReturnType<typeof useBulkUploadForm>;

defineProps<{
  form: BulkForm;
}>();
</script>

<template>
  <section class="upload-form__section">
    <h2>Batch details</h2>
    <div class="upload-form__fields">
      <label>
        School
        <select v-model="form.school.value">
          <option value="" disabled>Select a school</option>
          <option v-for="option in form.schoolOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </label>

      <label>
        Grade
        <select v-model="form.grade.value" :disabled="!form.school.value">
          <option value="" disabled>Select a grade</option>
          <option v-for="option in form.gradeOptions.value" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>

      <label>
        Display name
        <input v-model="form.name.value" />
      </label>

      <label>
        Batch price
        <input v-model.number="form.price.value" type="number" min="0" />
        <small>Updates every book in the batch.</small>
      </label>

      <label>
        Batch quantity
        <input v-model.number="form.quantity.value" type="number" min="1" />
        <small>Updates every book in the batch.</small>
      </label>
    </div>

    <div v-if="form.errors.value.school || form.errors.value.grade || form.errors.value.name || form.errors.value.price || form.errors.value.quantity || form.errors.value.books" class="upload-form__errors">
      <p v-if="form.errors.value.school">{{ form.errors.value.school }}</p>
      <p v-if="form.errors.value.grade">{{ form.errors.value.grade }}</p>
      <p v-if="form.errors.value.name">{{ form.errors.value.name }}</p>
      <p v-if="form.errors.value.price">{{ form.errors.value.price }}</p>
      <p v-if="form.errors.value.quantity">{{ form.errors.value.quantity }}</p>
      <p v-if="form.errors.value.books">{{ form.errors.value.books }}</p>
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

.upload-form__section h2 {
  font-family: 'Manrope';
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.upload-form__fields {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.upload-form__fields label {
  flex: 1 1 280px;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-family: 'Nunito';
}

.upload-form__fields input,
.upload-form__fields select {
  width: 100%;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 12px;
  padding: 0.75rem;
  background: white;
}

.upload-form__fields select:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.upload-form__errors {
  margin-top: 0.875rem;
  display: grid;
  gap: 0.25rem;
  font-family: 'Nunito';
  color: #dc2626;
}
</style>
