<script setup lang="ts">
withDefaults(defineProps<{
  rows?: number;
}>(), {
  rows: 3
});
</script>

<template>
  <div class="skeleton-rows" aria-hidden="true">
    <div v-for="row in rows" :key="row" class="skeleton-row"></div>
  </div>
</template>

<style scoped lang="scss">
.skeleton-rows {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.skeleton-row {
  height: 64px;
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    rgba(148, 163, 184, 0.22) 0%,
    rgba(148, 163, 184, 0.4) 50%,
    rgba(148, 163, 184, 0.22) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite linear;
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -200% 0;
  }
}
</style>
