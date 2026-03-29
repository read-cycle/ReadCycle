<script setup lang="ts">
import { ref } from 'vue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase-init';
import CTACard from './CTACard.vue';
import chats from '../assets/images/chats.svg';
import browse from '../assets/images/browse2.svg';
import upload from '../assets/images/scan.svg';
import router from '../router';

const icons = ['<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><circle cx="11.5" cy="14.5" r="2.5"/><path d="M13.3 16.3 15 18"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/></svg>'];
const name = ref('');

onAuthStateChanged(auth, (user) => {
  if (user) name.value = user.displayName || '';
});
</script>

<template>
  <section class="dashboard-hero">
    <div class="dashboard-hero__text">
      <h2>Welcome back, {{ name || 'Reader' }}.</h2>
    </div>
    <div class="dashboard-section">
      <CTACard title="Browse Books" description="Find available books near you." :icon="icons[0]" :scenario="browse" :imagePan="20" @click="router.push('/browse')" />
      <CTACard title="Upload Books" description="List a book for exchange." :icon="icons[1]" :scenario="upload" :imagePan="15" @click="router.push('/upload')" />
      <CTACard title="Chats" description="Continue active matches." :icon="icons[2]" :scenario="chats" @click="router.push('/chats')" />
    </div>
  </section>
</template>

<style scoped lang="scss">
.dashboard-hero {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(58, 122, 254, 0.08), rgba(15, 23, 42, 0.04));
}

.dashboard-hero__text {
  font-family: Manrope;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.dashboard-hero__text h2 {
  margin: 0;
}

.dashboard-section {
  display: flex;
  flex-grow: 1;
  flex-wrap: wrap;
  align-items: stretch;
  justify-content: flex-start;
  gap: 16px;
}
</style>
