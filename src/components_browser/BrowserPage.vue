<script setup lang="ts">
import MetaBar from '../components/MetaBar.vue';
import Navbar from '../components/Navbar.vue';
import NotificationsModal from '../components/NotificationsModal.vue';
import Sidebar from '../components/Sidebar.vue';
import { useBrowserPage } from '../composables/useBrowserPage';
import BrowserRequestModal from './BrowserRequestModal.vue';
import BrowserResults from './BrowserResults.vue';
import BrowserToolbar from './BrowserToolbar.vue';

const { loading, submitLoading, searchQuery, filteredDocs, selectedDoc, requestForm, notifications, selectDoc, closeSelectedDoc, submitRequest } = useBrowserPage();
</script>

<template>
  <Sidebar class="browser-sidebar" />
  <Navbar class="browser-navbar" />
  <main class="browser-page">
    <MetaBar title="Browse" @notif-click="notifications.openNotification" />
    <BrowserToolbar v-model="searchQuery" />
    <BrowserResults :loading="loading" :docs="filteredDocs" @select="selectDoc" />
  </main>

  <BrowserRequestModal :open="Boolean(selectedDoc)" :item="selectedDoc" :request-form="requestForm" :submit-loading="submitLoading" @close="closeSelectedDoc" @submit="submitRequest" />
  <NotificationsModal :open="notifications.notificationsOpen.value" :item="notifications.activeNotification.value" :action-loading="notifications.notificationLoading.value" @close="notifications.closeNotification" @accept="notifications.acceptRequest" @deny="notifications.denyRequest" />
</template>

<style scoped lang="scss">
.browser-page {
  min-height: 100dvh;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: $color-background;
  color: $color-text;
}

@media (min-width: 1025px) {
  .browser-page {
    margin-left: 6rem;
  }

  .browser-navbar {
    display: none;
  }
}

@media (max-width: 1024px) {
  .browser-sidebar {
    display: none;
  }
}
</style>
