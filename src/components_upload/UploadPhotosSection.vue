<script setup lang="ts">
defineProps<{
  listingImageName: string;
  extraImagesCount: number;
}>();

defineEmits<{
  listingImageChange: [Event];
  extraImagesChange: [Event];
}>();
</script>

<template>
  <section class="upload-form__section">
    <h2>Photos</h2>
    <div class="upload-form__fields">
      <label>
        Listing image
        <input type="file" accept="image/*" @change="$emit('listingImageChange', $event)" />
        <small v-if="listingImageName">{{ listingImageName }}</small>
      </label>
      <label>
        Extra images
        <input type="file" accept="image/*" multiple @change="$emit('extraImagesChange', $event)" />
        <small v-if="extraImagesCount">{{ extraImagesCount }} selected</small>
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
</style>
