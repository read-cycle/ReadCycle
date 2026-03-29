<script setup lang="ts">
import LoginInput from './LoginInput.vue';
import emailIcon from '../assets/icons/email.svg?raw';
import lockIcon from '../assets/icons/lock.svg?raw';
import nameIcon from '../assets/icons/user.svg?raw';
import confirmIcon from '../assets/icons/check-big.svg?raw';
import { useLoginPage } from '../composables/useLoginPage';

const { email, password, name, confirmPassword, rememberMe, newUser, resetPassword } = useLoginPage();
</script>

<template>
  <div
    class="login-inputs"
    :style="{ gridRow: newUser ? '6 / 17' : '11 / 17', justifyContent: newUser ? 'center' : 'space-between' }"
  >
    <div v-if="newUser" class="login-input-wrapper">
      <LoginInput
        v-model="name"
        field-name="Name"
        :field-icon="nameIcon"
        placeholder="John Doe"
        field-type="text"
      />
    </div>

    <div class="login-input-wrapper">
      <LoginInput
        v-model="email"
        field-name="Email"
        :field-icon="emailIcon"
        placeholder="example@abc.com"
        field-type="email"
      />
    </div>

    <div class="login-input-wrapper">
      <LoginInput
        v-model="password"
        field-name="Password"
        :field-icon="lockIcon"
        placeholder="••••••••"
        field-type="password"
      />
    </div>

    <div v-if="newUser" class="login-input-wrapper">
      <LoginInput
        v-model="confirmPassword"
        field-name="Verify Password"
        :field-icon="confirmIcon"
        placeholder="••••••••"
        field-type="password"
      />
    </div>

    <div class="metadata-container">
      <div class="remember-me-container">
        <input id="remember-me-checkbox" v-model="rememberMe" type="checkbox">
        <label class="remember-me-text" for="remember-me-checkbox">Remember me</label>
      </div>

      <p v-if="!newUser" class="forgot-password" @click="resetPassword()">Forgot Password?</p>
    </div>
  </div>
</template>
