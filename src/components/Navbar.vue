<script setup lang="ts">
import { LayoutDashboard, FileSearch2, Upload, MessageSquare } from "lucide-vue-next";
import { useChatUnreadCount } from '../composables/useChatUnreadCount';

const { unreadChatCount } = useChatUnreadCount();
</script>
<template>
    <div class="navbar-container">
        <ul class="navbar-wrapper">
            <router-link to="/dashboard" class="navbar-item" active-class="active-link" exact>
              <LayoutDashboard></LayoutDashboard>
            </router-link>
            <router-link to="/browse" class="navbar-item" active-class="active-link" exact>
              <FileSearch2></FileSearch2>
            </router-link>
            <router-link to="/upload" class="navbar-item" active-class="active-link" exact>
              <Upload></Upload>
            </router-link>
            <router-link to="/chats" class="navbar-item" active-class="active-link" exact>
              <span class="navbar-icon-wrap">
                <MessageSquare></MessageSquare>
                <span v-if="unreadChatCount" class="navbar-badge">{{ unreadChatCount > 9 ? '9+' : unreadChatCount }}</span>
              </span>
            </router-link>
        </ul>
    </div>
</template>
<style lang="scss" scoped>
.navbar-container {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    max-width: 100%;
    height: var(--mobile-bottom-nav-height);
    padding-bottom: env(safe-area-inset-bottom);
    background-color: $color-background-secondary;
    z-index: 999;
    overflow: hidden;
    .navbar-wrapper {
        @extend %filler;
        display: flex;
        min-width: 0;
        .navbar-item {
            flex: 1;
            min-width: 0;
            @extend %centered;
            position: relative;
            font-family: 'Nunito';
            svg {
                height: 50%;
                aspect-ratio: 1/1;
                transition: color 1s ease-in-out;
                color: lightgray
            }
            &:hover {
                color: $color-primary-darkened;
            }
        }
    }
}

.navbar-icon-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.navbar-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.65rem;
  min-width: 1.1rem;
  height: 1.1rem;
  padding: 0 0.25rem;
  border-radius: 999px;
  background: #ef4444;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Manrope';
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 1;
}
</style>
