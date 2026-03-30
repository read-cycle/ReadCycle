<script setup lang="ts">
import MetaBar from '../components/MetaBar.vue';
import Navbar from '../components/Navbar.vue';
import NotificationsModal from '../components/NotificationsModal.vue';
import Sidebar from '../components/Sidebar.vue';
import { useDashboardPage } from '../composables/useDashboardPage';
import Hero from './Hero.vue';
import StatOption from './StatOption.vue';
import Table from './Table.vue';
import WatchlistModal from './WatchlistModal.vue';
import {Binoculars, Book, Timer, Upload} from "lucide-vue-next";

const { pendingData, uploadData, watchData, dashboardLoading, watchlistModalOpen, watchlistLoading, watchlistForm, notifications, submitWatchlist, removeUpload, removeWatchlistItem } = useDashboardPage();
</script>

<template>
  <Sidebar class="dashboard-sidebar" />
  <Navbar class="dashboard-navbar" />
  <main class="dashboard-page">
    <MetaBar title="Dashboard" @notif-click="notifications.openNotification" />

    <Hero />

    <section class="dashboard-section dashboard-section--stats">
      <StatOption key="Pending" header="Pending" :text="pendingData.length" :icon="Timer" />
      <StatOption key="Uploads" header="Uploads" :text="uploadData.length" :icon="Upload" />
      <StatOption key="Watching" header="Watching" :text="watchData.length" :icon="Binoculars" />
    </section>

    <section class="dashboard-panels">
      <Table table-type="listings" header="My Listings" :icon="Book" :loading="dashboardLoading" :docs="uploadData" @delete="removeUpload" />
      <Table table-type="watchlist" header="Watchlist" :icon="Binoculars" :loading="dashboardLoading" :docs="watchData" @watchlist-click="watchlistModalOpen = true" @delete="removeWatchlistItem" />
    </section>
  </main>

  <NotificationsModal :open="notifications.notificationsOpen.value" :item="notifications.activeNotification.value" :action-loading="notifications.notificationLoading.value" @close="notifications.closeNotification" @accept="notifications.acceptRequest" @deny="notifications.denyRequest" />
  <WatchlistModal :open="watchlistModalOpen" :form="watchlistForm" :loading="watchlistLoading" @close="watchlistModalOpen = false" @submit="submitWatchlist" />
</template>

<style scoped lang="scss">
.dashboard-page {
  min-height: 100dvh;
  padding: 1rem;
  margin-left: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: $color-background;
  color: $color-text;
}

.dashboard-section {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  justify-content: flex-start;
  gap: 16px;
}

.dashboard-panels {
  display: flex;
  flex-grow: 2;
  flex-wrap: wrap;
  gap: 1rem;
}

.dashboard-panels > * {
  flex: 1 1 420px;
  min-width: 0;
}

.dashboard-empty {
  padding: 1rem;
  border-radius: 16px;
  background: rgba(58, 122, 254, 0.05);
  text-align: center;
  font-family: 'Nunito';
}

@media (min-width: 1025px) {
  .dashboard-page {
    margin-left: 6rem;
  }

  .dashboard-navbar {
    display: none;
  }
}

@media (max-width: 1024px) {
  .dashboard-sidebar {
    display: none;
  }

  .dashboard-page {
    padding-bottom: calc(1rem + var(--mobile-bottom-nav-height) + env(safe-area-inset-bottom));
  }
}
</style>
