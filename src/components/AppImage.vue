<script setup lang="ts">
const props = withDefaults(defineProps<{
  src: string;
  alt: string;
  eager?: boolean;
}>(), {
  eager: false
});
</script>

<template>
  <img
    v-if="props.src"
    :src="props.src"
    :alt="props.alt"
    :loading="props.eager ? 'eager' : 'lazy'"
    :fetchpriority="props.eager ? 'high' : 'low'"
    decoding="async"
  />
</template>
