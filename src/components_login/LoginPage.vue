<script setup lang="ts">
import LoginBrand from './LoginBrand.vue';
import LoginHeader from './LoginHeader.vue';
import LoginSocialOptions from './LoginSocialOptions.vue';
import LoginForm from './LoginForm.vue';
import LoginSubmitActions from './LoginSubmitActions.vue';
import LoginCarousel from './LoginCarousel.vue';
import { provideLoginPage } from '../composables/useLoginPage';

const { submitAuthForm } = provideLoginPage();
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <form class="text-half-login" @submit.prevent="submitAuthForm">
        <LoginBrand />
        <LoginHeader />
        <LoginSocialOptions />
        <LoginForm />
        <LoginSubmitActions />
      </form>

      <div class="graphic-half-login">
        <LoginCarousel />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@media screen and (min-width: 1150px) {
  :deep(.tooltip) {
    font-size: px-to-vw(10);
  }

  .text-half-login {
    padding: px-to-vw(60);
  }

  :deep(input[type="checkbox"]) {
    width: px-to-vw(18);
    height: px-to-vw(18);
  }

  :deep(.divider-container) {
    font-size: px-to-vw(14);
  }

  :deep(.sign-up) {
    font-size: px-to-vw(14);
  }

  :deep(.alt-login svg) {
    width: px-to-vw(20);
    height: px-to-vw(20);
  }

  :deep(.login-logo) {
    font-size: px-to-vw(15);
  }

  :deep(.login-logo .logo-icon) {
    width: px-to-vw(25);
  }

  .login-box {
    aspect-ratio: 2/1;
  }

  :deep(.login-header) {
    font-size: 3vw;
  }

  :deep(.login-para) {
    font-size: px-to-vw(15);
  }

  :deep(.social-hint) {
    font-size: px-to-vw(13);
  }

  :deep(.login-btn) {
    font-size: px-to-vw(20);
  }

  :deep(.forgot-password) {
    font-size: px-to-vw(14);
  }

  :deep(.remember-me-container) {
    font-size: px-to-vw(14);
  }
}

@media screen and (max-width: 1150px) {
  :deep(.tooltip) {
    font-size: px-to-vw(12);
  }

  .text-half-login {
    padding: px-to-vw(50);
  }

  :deep(input[type="checkbox"]) {
    width: px-to-vw(18);
    height: px-to-vw(18);
  }

  :deep(.divider-container) {
    font-size: px-to-vw(18);
  }

  :deep(.sign-up) {
    font-size: px-to-vw(14);
  }

  :deep(.alt-login svg) {
    width: px-to-vw(20);
    height: px-to-vw(20);
  }

  :deep(.login-logo) {
    font-size: px-to-vw(15);
  }

  :deep(.login-logo .logo-icon) {
    width: px-to-vw(25);
  }

  .login-box {
    aspect-ratio: 2/1;
  }

  :deep(.login-header) {
    font-size: px-to-vw(59);
  }

  :deep(.login-para) {
    font-size: px-to-vw(18);
  }

  :deep(.social-hint) {
    font-size: px-to-vw(13);
  }

  :deep(.login-btn) {
    font-size: px-to-vw(20);
  }

  :deep(.forgot-password) {
    font-size: px-to-vw(16);
  }

  :deep(.remember-me-container) {
    font-size: px-to-vw(16);
  }
}

@media screen and (max-width: 850px) {
  :deep(.tooltip) {
    font-size: px-to-vw(30);
  }

  .text-half-login {
    padding: px-to-vw(80);
  }

  :deep(input[type="checkbox"]) {
    width: px-to-vw(28);
    height: px-to-vw(28);
  }

  :deep(.sign-up) {
    font-size: px-to-vw(28);
  }

  :deep(.alt-login svg) {
    width: px-to-vw(45);
    height: px-to-vw(45);
  }

  .graphic-half-login {
    display: none;
  }

  .login-box {
    aspect-ratio: 4/5;
  }

  :deep(.login-logo) {
    font-size: px-to-vw(45);
  }

  :deep(.login-logo .logo-icon) {
    width: px-to-vw(75);
  }

  :deep(.login-header) {
    font-size: px-to-vw(118);
  }

  :deep(.login-para) {
    font-size: px-to-vw(37.5);
  }

  :deep(.social-hint) {
    font-size: px-to-vw(34);
  }

  :deep(.login-btn) {
    font-size: px-to-vw(50);
  }

  :deep(.forgot-password) {
    font-size: px-to-vw(35);
  }

  :deep(.remember-me-container) {
    font-size: px-to-vw(35);
  }

  :deep(.divider-container) {
    font-size: px-to-vw(40);
  }
}

@media screen and (max-width: 550px) {
  :deep(.tooltip) {
    font-size: px-to-vw(30);
  }

  .text-half-login {
    padding: px-to-vw(60);
  }

  :deep(input[type="checkbox"]) {
    width: px-to-vw(36);
    height: px-to-vw(36);
  }

  :deep(.sign-up) {
    font-size: px-to-vw(28);
  }

  :deep(.alt-login svg) {
    width: px-to-vw(45);
    height: px-to-vw(45);
  }

  .graphic-half-login {
    display: none;
  }

  .login-box {
    aspect-ratio: 4/5;
  }

  :deep(.login-logo) {
    font-size: px-to-vw(45);
  }

  :deep(.login-logo .logo-icon) {
    width: px-to-vw(75);
  }

  :deep(.login-header) {
    font-size: px-to-vw(118);
  }

  :deep(.login-para) {
    font-size: px-to-vw(37.5);
  }

  :deep(.social-hint) {
    font-size: px-to-vw(34);
  }

  :deep(.login-btn) {
    font-size: px-to-vw(50);
  }

  :deep(.forgot-password) {
    font-size: px-to-vw(35);
  }

  :deep(.remember-me-container) {
    font-size: px-to-vw(35);
  }

  :deep(.divider-container) {
    font-size: px-to-vw(50);
  }
}

:deep(.fade-enter-active),
:deep(.fade-leave-active) {
  transition: opacity 0.5s ease;
}

:deep(.fade-enter-from),
:deep(.fade-leave-to) {
  opacity: 0;
}

:deep(input[type="checkbox"]) {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  border: 1px solid #999;
  border-radius: px-to-vw(4);
  cursor: pointer;
  position: relative;
  transition: background 0.2s ease;
}

:deep(input[type="checkbox"]:checked) {
  background-color: $color-primary;
  border-color: transparent;
}

:deep(input[type="checkbox"]:checked::after) {
  content: '';
  position: absolute;
  top: 40%;
  left: 50%;
  width: 40%;
  height: 80%;
  border: solid white;
  border-width: 0 0.2vw 0.2vw 0;
  border-radius: 2px;
  transform: translate(-50%, -50%) rotate(45deg);
}

.login-container {
  color: $color-text;
  width: 100dvw;
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $color-background-tertiary;
}

.login-box {
  width: 72%;
  background-color: $color-background;
  border-radius: 30px;
  display: flex;
  overflow: hidden;
}

.text-half-login {
  flex: 1;
  display: grid;
  padding-top: 0;
  font-family: 'Manrope';
  grid-template-rows: repeat(20, 1fr);
}

.text-half-login :deep(.login-logo) {
  display: flex;
  align-items: center;
  grid-row: 2 / 3;
  height: 100%;
  column-gap: 10px;
}

.text-half-login :deep(.login-logo .logo-icon) {
  aspect-ratio: 1 / 1;
}

.text-half-login :deep(.login-header-container) {
  grid-row: 4 / 5;
}

.text-half-login :deep(.login-header-container .login-header) {
  color: $color-accent;
}

.text-half-login :deep(.login-header-container .social-hint a) {
  text-decoration: underline;
  color: $color-accent;
  cursor: pointer;
}

.graphic-half-login {
  flex: 1;
  padding: 0.5vw;
}

.graphic-half-login :deep(.carousel-container) {
  padding: 1vw;
  width: 100%;
  height: 100%;
  border-radius: 30px;
  background-color: $color-accent-lightened;
}

.graphic-half-login :deep(.carousel-item) {
  width: 100%;
  height: 90%;
  display: flex;
  flex-direction: column;
}

.graphic-half-login :deep(.image-container) {
  height: 90%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.graphic-half-login :deep(.image-container img) {
  height: 100%;
}

.graphic-half-login :deep(.image-caption) {
  height: 10%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Nunito';
  color: white;
  font-size: px-to-vw(15);
}

.graphic-half-login :deep(.slide-indicator-container) {
  height: 10%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.graphic-half-login :deep(.slide-indicator) {
  width: 80px;
  aspect-ratio: 3 / 1;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  background-color: rgba($color-accent, 0.5);
  border-radius: 5px;
}

.graphic-half-login :deep(.dot) {
  width: 4px;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
}

.graphic-half-login :deep(.filled) {
  background-color: white;
}

:deep(.login-btn-container) {
  grid-row: 18 / 21;
  display: flex;
  flex-direction: column;
  row-gap: px-to-vw(10);
}

:deep(.sign-up) {
  color: $color-accent;
  text-decoration: underline;
  cursor: pointer;
  width: fit-content;
}

:deep(.login-btn-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

:deep(.login-btn) {
  height: 100%;
  aspect-ratio: 4 / 1;
  font-family: 'Nunito';
  border-radius: 14px;
  background: linear-gradient(to right, $color-secondary, $color-secondary-lightened);
  cursor: pointer;
  border: 4px solid $color-background;
  transition: box-shadow 0.4s ease;
}

:deep(.login-btn:hover) {
  box-shadow: 0 0 0 4px $color-primary;
}

:deep(.login-inputs) {
  display: flex;
  flex-direction: column;
  justify-content: center;
  row-gap: 10px;
}

:deep(.login-input-wrapper) {
  width: 50%;
}

:deep(.metadata-container) {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:deep(.forgot-password) {
  color: $color-accent;
  text-decoration: underline;
  cursor: pointer;
  width: fit-content;
}

:deep(.remember-me-container) {
  display: flex;
  align-items: center;
  column-gap: 7px;
}

:deep(.alternatives-container) {
  grid-row: 7 / 9;
  width: 50%;
  display: flex;
  align-content: center;
  justify-content: space-between;
}

:deep(.alt-login) {
  width: 20%;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  border: $color-background 1px 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
}

:deep(.alt-login:hover) {
  transform: translateY(-2px);
}

:deep(.alt-login svg) {
  fill: $color-accent;
}

:deep(.tooltip) {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  bottom: 115%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 0.35em 0.7em;
  border-radius: 999px;
  transition: opacity 0.2s ease;
  white-space: nowrap;
}

:deep(.alt-login:hover .tooltip) {
  opacity: 1;
}

:deep(.divider-container) {
  grid-row: 9 / 10;
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 12px;
}

:deep(.divider-container hr) {
  width: 100%;
  border: none;
  border-top: 1px solid rgba($color-text, 0.2);
}
</style>
