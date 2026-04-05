<script setup lang="ts">
import Hero from './Hero.vue'
import Navbar from './Navbar.vue';
import Abt from './Abt.vue';
import ContactUs from './ContactUs.vue';
import BookCarousel from './BookCarousel.vue';
import HowItWorks from './HowItWorks.vue';
import ChatBot from "@/components/ChatBot.vue";
</script>
<template>
    <ChatBot></ChatBot>
    <Navbar></Navbar>
    <div class="page-container">
        <Hero></Hero>
        <BookCarousel></BookCarousel>
        <HowItWorks></HowItWorks>
        <Abt></Abt>
        <ContactUs></ContactUs>
    </div>
</template>
<style lang="scss" scoped>
.page-container {
    width: 100%;
    min-height: 100%;
}
</style>
