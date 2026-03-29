<script setup lang="ts">
import LoadingButton from '../components/LoadingButton.vue';
import type { useForm } from '../composables/useForm';

type PageForm = ReturnType<typeof useForm>;

defineProps<{
  open: boolean;
  form: PageForm;
  loading: boolean;
}>();

defineEmits<{
  close: [];
  submit: [];
}>();
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
            ISBN
            <input v-model="form.isbn.value" list="dashboard-isbn-options" @blur="form.runIsbnLookup" />
          </label>
          <datalist id="dashboard-isbn-options">
            <option v-for="option in form.isbnOptions" :key="option" :value="option" />
          </datalist>
          <label>
            Title
            <input v-model="form.title.value" list="dashboard-title-options" @blur="form.inferFromTitle" />
          </label>
          <datalist id="dashboard-title-options">
            <option v-for="option in form.titleOptions" :key="option" :value="option" />
          </datalist>
          <label>
            Grade
            <input v-model="form.grade.value" list="dashboard-grade-options" />
          </label>
          <datalist id="dashboard-grade-options">
            <option v-for="option in form.gradeOptions" :key="option" :value="option" />
          </datalist>
          <label>
            Subject
            <input v-model="form.subject.value" list="dashboard-subject-options" />
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
}

.watchlist-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
}

.watchlist-modal__panel {
  position: relative;
  z-index: 1;
  width: min(100% - 2rem, 760px);
  margin: 4vh auto 0;
  border-radius: 18px;
  background: $color-background;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.watchlist-modal__panel h2 {
  font-family: 'Manrope';
  font-size: 1.5rem;
}

.watchlist-modal__close {
  align-self: flex-end;
  min-width: auto;
  border: none;
  background: transparent;
  cursor: pointer;
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
  font-size: 1.125rem;
}

.watchlist-form__section label {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-family: 'Nunito';
}

.watchlist-form__section input {
  width: 100%;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 12px;
  padding: 0.75rem;
}
</style>
