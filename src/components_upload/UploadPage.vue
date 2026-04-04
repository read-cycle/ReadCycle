<script setup lang="ts">
import LoadingButton from '../components/LoadingButton.vue';
import MetaBar from '../components/MetaBar.vue';
import Navbar from '../components/Navbar.vue';
import NotificationsModal from '../components/NotificationsModal.vue';
import Sidebar from '../components/Sidebar.vue';
import { useUploadPage } from '../composables/useUploadPage';
import IsbnRecommendationModal from './IsbnRecommendationModal.vue';
import UploadBookDetailsSection from './UploadBookDetailsSection.vue';
import UploadListingDetailsSection from './UploadListingDetailsSection.vue';
import UploadModeSwitch from './UploadModeSwitch.vue';
import UploadPhotosSection from './UploadPhotosSection.vue';

const {
  form,
  listingImage,
  extraImages,
  isbnRecommendationOpen,
  isbnRecommendationLoading,
  skipIsbnRecommendation,
  notifications,
  handleListingImage,
  handleExtraImages,
  closeIsbnRecommendation,
  confirmUploadWithoutIsbn,
  submitUpload
} = useUploadPage();
</script>

<template>
  <Sidebar class="upload-sidebar" />
  <Navbar class="upload-navbar" />
  <main class="upload-page">
    <MetaBar title="Upload" @notif-click="notifications.openNotification" />
    <UploadModeSwitch />
    <form class="upload-form" @submit.prevent="submitUpload">
      <UploadBookDetailsSection :form="form" />
      <UploadListingDetailsSection :form="form" />
      <UploadPhotosSection :listing-image-name="listingImage?.name || ''" :extra-images-count="extraImages.length" @listing-image-change="handleListingImage" @extra-images-change="handleExtraImages" />

      <div v-if="form.status.value === 'success'" class="upload-banner upload-banner--success">
        Upload complete.
      </div>
      <div v-if="form.status.value === 'error'" class="upload-banner upload-banner--error">
        Upload failed. Try again.
      </div>

      <LoadingButton type="submit" label="Submit listing" :loading="form.status.value === 'loading'" />
    </form>
  </main>

  <NotificationsModal :open="notifications.notificationsOpen.value" :item="notifications.activeNotification.value" :action-loading="notifications.notificationLoading.value" @close="notifications.closeNotification" @accept="notifications.acceptRequest" @deny="notifications.denyRequest" />
  <IsbnRecommendationModal
    :open="isbnRecommendationOpen.value"
    :dont-show-again="skipIsbnRecommendation.value"
    :action-loading="isbnRecommendationLoading.value"
    @close="closeIsbnRecommendation"
    @confirm="confirmUploadWithoutIsbn"
    @update:dont-show-again="skipIsbnRecommendation.value = $event"
  />
</template>

<style scoped lang="scss">
.upload-page {
  min-height: 100dvh;
  width: 100%;
  max-width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: $color-background;
  color: $color-text;
  overflow-x: clip;
}

.upload-form {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-form__section {
  border-radius: 18px;
  padding: 1rem;
  background: $color-background-secondary;
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.upload-form__fields {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.upload-form__fields label {
  flex: 1 1 280px;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-family: 'Nunito';
}

.upload-form__fields input {
  width: 100%;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 12px;
  padding: 0.75rem;
}

.upload-form__lookup,
.autofill-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Nunito';
}

.autofill-badge button {
  min-width: auto;
  border: none;
  background: transparent;
  color: $color-primary;
  cursor: pointer;
}

.upload-banner {
  padding: 0.875rem 1rem;
  border-radius: 14px;
  font-family: 'Nunito';
}

.upload-banner--success {
  background: rgba(34, 197, 94, 0.12);
}

.upload-banner--error {
  background: rgba(239, 68, 68, 0.12);
}

@media (min-width: 1025px) {
  .upload-page {
    margin-left: 6rem;
  }

  .upload-navbar {
    display: none;
  }
}

@media (max-width: 1024px) {
  .upload-sidebar {
    display: none;
  }

  .upload-page {
    padding-bottom: calc(1rem + var(--mobile-bottom-nav-height) + env(safe-area-inset-bottom));
  }
}
</style>
