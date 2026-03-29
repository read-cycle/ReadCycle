<script setup lang="ts">
import LoadingButton from '../components/LoadingButton.vue';
import { useLoginPage } from '../composables/useLoginPage';

const { authLoading, newUser } = useLoginPage();
</script>

<template>
  <div class="login-btn-container">
    <div class="login-btn-wrapper">
      <LoadingButton
        v-if="!newUser"
        type="submit"
        class="login-btn"
        label="Log In"
        :loading="authLoading"
      />
      <LoadingButton
        v-else
        type="submit"
        class="login-btn"
        label="Sign Up"
        :loading="authLoading"
      />
    </div>

    <p v-if="!newUser" class="sign-up" @click="newUser = true">Don't have an account? Sign Up</p>
    <p v-else class="sign-up" @click="newUser = false">Have an account? Log in</p>
  </div>
</template>
