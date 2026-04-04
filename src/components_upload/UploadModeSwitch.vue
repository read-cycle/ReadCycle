<template>
  <div class="upload-mode-switch">
    <router-link to="/upload" class="upload-mode-switch__item" active-class="upload-mode-switch__item--active" exact>
      Single Upload
    </router-link>
    <router-link to="/upload/bulk" class="upload-mode-switch__item" active-class="upload-mode-switch__item--active" exact>
      Bulk Upload
    </router-link>
  </div>
</template>

<style scoped lang="scss">
.upload-mode-switch {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  width: fit-content;
}

.upload-mode-switch__item {
  padding: 0.65rem 1rem;
  border-radius: 999px;
  text-decoration: none;
  color: $color-text-secondary;
  font-family: 'Nunito';
  font-weight: 700;
  transition: background-color 180ms ease, color 180ms ease;
}

.upload-mode-switch__item--active {
  background: $color-background-secondary;
  color: $color-accent;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
}
</style>
