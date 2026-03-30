<script setup lang="ts">
import { useLoginPage } from '../composables/useLoginPage';

const { authLoading, newUser } = useLoginPage();
</script>

<template>
  <div class="login-btn-container">
    <div class="login-btn-wrapper">
      <button
        v-if="!newUser"
        type="submit"
        class="login-btn"
        :disabled="authLoading"
      >
        Log In
      </button>
      <button
        v-else
        type="submit"
        class="login-btn"
        :disabled="authLoading"
      >
        Sign Up
      </button>
    </div>

    <p v-if="!newUser" class="sign-up" @click="newUser = true">Don't have an account? Sign Up</p>
    <p v-else class="sign-up" @click="newUser = false">Have an account? Log in</p>
  </div>
</template>
