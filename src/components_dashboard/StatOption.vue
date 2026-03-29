<script setup lang="ts">
import type {LucideIcon} from "lucide-vue-next";

defineProps<{
  header?: string;
  text?: string | number;
  icon?: LucideIcon;
}>();
</script>

<template>
  <div class="stat-option">
    <div class="stat-option__icon">
      <component :is="icon" v-if="icon" />
    </div>
    <p class="stat-option__header">{{ header }}</p>
    <p class="stat-option__text">{{ text }}</p>
  </div>
</template>

<style scoped lang="scss">
.stat-option {
  flex: 1 1 160px;
  min-width: 160px;
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
  justify-content: center;
  background: $color-background-secondary;
}

.stat-option__header,
.stat-option__text {
  font-family: Nunito;
  margin: 0;
}

.stat-option__icon :deep(svg) {
  width: 22px;
  height: 22px;
}
</style>
