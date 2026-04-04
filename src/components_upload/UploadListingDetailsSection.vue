<script setup lang="ts">
import type { useForm } from '../composables/useForm';

type PageForm = ReturnType<typeof useForm>;

defineProps<{
  form: PageForm;
}>();
</script>

<template>
  <section class="upload-form__section">
    <h2>Listing details</h2>
    <div class="upload-form__fields">
      <label>
        <span class="field-label">
          Price
          <span class="field-indicator field-indicator--required">Required</span>
        </span>
        <input v-model.number="form.price.value" type="number" min="0" />
        <small>Set to 0 for free</small>
      </label>
      <label>
        <span class="field-label">
          Quantity
          <span class="field-indicator field-indicator--required">Required</span>
        </span>
        <input v-model.number="form.quantity.value" type="number" min="1" />
      </label>
      <label>
        <span class="field-label">
          Display name
          <span class="field-indicator field-indicator--required">Required</span>
        </span>
        <input v-model="form.name.value" />
      </label>
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

.upload-form__fields {
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
</style>
