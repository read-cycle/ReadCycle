<script setup lang="ts">
import { useLoginPage } from '../composables/useLoginPage';

const { activeItem, imageData } = useLoginPage();
</script>

<template>
  <div class="carousel-container">
    <transition name="fade" mode="out-in">
      <div v-if="activeItem" :key="activeItem[0]" class="carousel-item">
        <div class="image-container">
          <img :src="activeItem[0]" alt="Scan">
        </div>
        <div class="image-caption">{{ activeItem[1] }}</div>
      </div>
    </transition>

    <div class="slide-indicator-container">
      <div class="slide-indicator">
        <div
          v-for="(item, index) in imageData"
          :key="index"
          class="dot"
          :class="{ filled: item[2] }"
        />
      </div>
    </div>
  </div>
</template>
