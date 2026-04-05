<script setup lang="ts">
import LoadingButton from '../components/LoadingButton.vue';
import MetaBar from '../components/MetaBar.vue';
import Navbar from '../components/Navbar.vue';
import NotificationsModal from '../components/NotificationsModal.vue';
import Sidebar from '../components/Sidebar.vue';
import { useBulkUploadPage } from '../composables/useBulkUploadPage';
import BulkUploadBooksSection from './BulkUploadBooksSection.vue';
import BulkUploadSelectionSection from './BulkUploadSelectionSection.vue';
import UploadModeSwitch from './UploadModeSwitch.vue';
import ChatBot from "@/components/ChatBot.vue";

const page = useBulkUploadPage();
</script>

<template>
  <ChatBot></ChatBot>
  <Sidebar class="upload-sidebar" />
  <Navbar class="upload-navbar" />
  <main class="upload-page">
    <MetaBar title="Bulk Upload" @notif-click="page.notifications.openNotification" />
    <UploadModeSwitch />

    <form class="upload-form" @submit.prevent="page.submitBulkUpload">
      <BulkUploadSelectionSection :form="page.form" />
      <BulkUploadBooksSection
        :books="page.books.value"
        :remaining-books="page.remainingBooks.value"
        :selected-book-to-add="page.selectedBookToAdd.value"
        :book-errors="page.bookErrors.value"
        @update:selected-book-to-add="page.selectedBookToAdd.value = $event"
        @add-book="page.addBook"
        @remove-book="page.removeBook"
        @set-book-image="page.setBookImage($event.bookId, $event.file)"
        @update-book-field="page.updateBookField($event.bookId, $event.field, $event.value)"
      />

      <div v-if="page.submissionProgress.value" class="upload-banner">
        Uploading {{ page.submissionProgress.value.completed }} of {{ page.submissionProgress.value.total }} books...
      </div>
      <div v-if="page.submissionSummary.value" class="upload-banner" :class="page.submissionSummary.value.failedTitles.length ? 'upload-banner--warning' : 'upload-banner--success'">
        <p>
          Uploaded: {{ page.submissionSummary.value.successTitles.length }}.
          Failed: {{ page.submissionSummary.value.failedTitles.length }}.
        </p>
        <p v-if="page.submissionSummary.value.successTitles.length">
          Successfully uploaded books will not be submitted again.
        </p>
        <p v-if="page.submissionSummary.value.failedTitles.length">
          Failed books were not uploaded. Retry the books marked as failed.
        </p>
      </div>
      <div v-if="page.form.status.value === 'success'" class="upload-banner upload-banner--success">
        Bulk upload complete.
      </div>
      <div v-if="page.form.status.value === 'error'" class="upload-banner upload-banner--error">
        Bulk upload failed. Try again.
      </div>

      <LoadingButton type="submit" label="Submit batch" :loading="page.form.status.value === 'loading'" />
    </form>
  </main>

  <NotificationsModal :open="page.notifications.notificationsOpen.value" :item="page.notifications.activeNotification.value" :action-loading="page.notifications.notificationLoading.value" @close="page.notifications.closeNotification" @accept="page.notifications.acceptRequest" @deny="page.notifications.denyRequest" />
</template>

<style scoped lang="scss">
.upload-page {
  min-height: 100dvh;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: $color-background;
  color: $color-text;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-banner {
  padding: 0.875rem 1rem;
  border-radius: 14px;
  font-family: 'Nunito';
  background: rgba(15, 23, 42, 0.06);
}

.upload-banner--success {
  background: rgba(34, 197, 94, 0.12);
}

.upload-banner--error {
  background: rgba(239, 68, 68, 0.12);
}

.upload-banner--warning {
  background: rgba(245, 158, 11, 0.14);
}

.upload-banner p {
  margin: 0;
}

.upload-banner p + p {
  margin-top: 0.35rem;
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
