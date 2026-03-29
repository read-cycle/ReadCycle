<script setup lang="ts">
defineProps<{
  title?: string;
  icon?: string;
  scenario?: string;
  imagePan?: number;
  description?: string;
}>();
</script>

<template>
  <button class="cta-card" type="button">
  <div
    class="cta-card__background"
    :style="{
      backgroundImage: scenario ? `url(${scenario})` : undefined,
      backgroundPosition: '100% ' + imagePan + '%' || undefined
    }"
  ></div>
    <div class="cta-card__content">
      <div class="cta-card__icon" v-html="icon"></div>
      <div class="cta-card__text">
        <h3 class="cta-card__title">{{ title }}</h3>
        <p class="cta-card__description">{{ description || 'Jump straight into the next action.' }}</p>
      </div>
      <span class="cta-card__footer">Open</span>
    </div>
  </button>
</template>

<style scoped lang="scss">
.cta-card {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 300px;
  min-width: 260px;
  max-width: 100%;
  flex-grow: 1;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  overflow: hidden;
  background: $color-background-5;
  color: $color-text;
  cursor: pointer;
  padding: 0;
}

.cta-card__background {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.16;
}

.cta-card__content {
  position: relative;
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  gap: 0.875rem;
  align-items: flex-start;
  justify-content: space-between;
  min-height: 180px;
  padding: 1rem;
}

.cta-card__icon :deep(svg) {
  width: 24px;
  height: 24px;
}

.cta-card__text {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  text-align: left;
}

.cta-card__title {
  margin: 0;
  font-family: 'Manrope';
  font-size: 1.5rem;
}

.cta-card__description,
.cta-card__footer {
  margin: 0;
  font-family: 'Nunito';
}

@media (max-width: 1024px) {
  .cta-card {
    flex: 1 1 auto;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 40px;
    min-height: 40px;
    padding: 0 12px;
  }

  .cta-card__content {
    min-height: auto;
    width: 100%;
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
    padding: 0;
  }

  .cta-card__description,
  .cta-card__footer {
    display: none;
  }

  .cta-card__title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
