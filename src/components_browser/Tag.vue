<script setup lang="ts">
const { text = 'hi' } = defineProps<{
  text?: string;
}>();
</script>

<template>
    <div class = "tag-container">
        <p>{{ text }}</p>
    </div>
</template>

<style lang="scss" scoped>
.tag-container {
  flex: 0 0 auto;
  background-color: $color-secondary;
  width: fit-content;
  border-radius: 4px;
  height: 100%;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 10px;
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Nunito';
  font-size: 10px;
  color: $color-text;
}
</style>
