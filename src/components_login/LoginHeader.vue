<script setup lang="ts">
import { useLoginPage } from '../composables/useLoginPage';

const { newUser } = useLoginPage();
</script>

<template>
  <div class="login-header-container">
    <h1 class="login-header">{{ newUser ? 'Sign Up' : 'Welcome Back!' }}</h1>
    <p class="login-para">
      {{ newUser ? 'Create your account below!' : 'Login with your email or use one of the following:' }}
    </p>
    <p v-if="newUser" class="social-hint">
      Want to use Google, Meta, Twitter or Microsoft? <a @click="newUser = false">Go back</a> and sign up instantly.
    </p>
  </div>
</template>
