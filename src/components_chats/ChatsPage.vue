<script setup lang="ts">
import MetaBar from '../components/MetaBar.vue';
import Navbar from '../components/Navbar.vue';
import NotificationsModal from '../components/NotificationsModal.vue';
import Sidebar from '../components/Sidebar.vue';
import SkeletonRow from '../components/SkeletonRow.vue';
import { useChatsPage } from '../composables/useChatsPage';
import ChatConversation from './ChatConversation.vue';
import ChatListPanel from './ChatListPanel.vue';

const { uploaderDocsData, buyerDocsData, currentDoc, displayItems, inputData, sending, loadingLists, emptyState, userId, files, notifications, selectChat, sendMessage } = useChatsPage();
</script>

<template>
  <Sidebar class="chats-sidebar" />
  <Navbar class="chats-navbar" />
  <main class="chats-page">
    <MetaBar title="Chats" @notif-click="notifications.openNotification" />

    <section v-if="loadingLists" class="chats-loading">
      <SkeletonRow :rows="3" />
    </section>

    <section v-else-if="emptyState" class="chats-empty">
      No active chats yet. 💬
    </section>

    <section v-else class="chats-layout">
      <aside class="chats-sidebar-panel">
        <ChatListPanel header="Uploaded by you" :docs="uploaderDocsData" :uploader="true" @select="selectChat" />
        <ChatListPanel header="Uploaded by others" :docs="buyerDocsData" :uploader="false" @select="selectChat" />
      </aside>

      <ChatConversation :current-doc="currentDoc" :display-items="displayItems" :current-user-id="userId" :input-value="inputData" :selected-files="files" :sending="sending" @update:input-value="inputData = $event" @submit="sendMessage" @files-selected="files = $event" />
    </section>
  </main>

  <NotificationsModal :open="notifications.notificationsOpen.value" :item="notifications.activeNotification.value" :action-loading="notifications.notificationLoading.value" @close="notifications.closeNotification" @accept="notifications.acceptRequest" @deny="notifications.denyRequest" />
</template>

<style scoped lang="scss">
.chats-page {
  height: 100dvh;
  min-height: 100dvh;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
  background: $color-background;
  color: $color-text;
}

.chats-layout {
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 1rem;
  overflow: hidden;
}

.chats-sidebar-panel {
  flex: 1 1 22rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 0;
}

.chat-list {
  border-radius: 18px;
  background: $color-background-secondary;
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 1rem;
}

.chats-empty {
  min-height: 180px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(58, 122, 254, 0.05);
  text-align: center;
  font-family: 'Nunito';
}

@media (min-width: 1025px) {
  .chats-page {
    margin-left: 6rem;
  }

  .chats-navbar {
    display: none;
  }
}

@media (max-width: 1024px) {
  .chats-sidebar {
    display: none;
  }
}
</style>
