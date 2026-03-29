<script setup lang="ts">
import LoginInput from './LoginInput.vue';
import { Mail } from "lucide-vue-next";
import { Lock } from "lucide-vue-next";
import { User2 } from "lucide-vue-next";
import { CircleCheckBig } from "lucide-vue-next";
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
        :field-icon="User2"
        placeholder="John Doe"
        field-type="text"
      />
    </div>

    <div class="login-input-wrapper">
      <LoginInput
        v-model="email"
        field-name="Email"
        :field-icon="Mail"
        placeholder="example@abc.com"
        field-type="email"
      />
    </div>

    <div class="login-input-wrapper">
      <LoginInput
        v-model="password"
        field-name="Password"
        :field-icon="Lock"
        placeholder="••••••••"
        field-type="password"
      />
    </div>

    <div v-if="newUser" class="login-input-wrapper">
      <LoginInput
        v-model="confirmPassword"
        field-name="Verify Password"
        :field-icon="CircleCheckBig"
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
