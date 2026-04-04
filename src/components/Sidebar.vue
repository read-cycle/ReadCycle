<script setup lang="ts">
import { signOut } from 'firebase/auth';
import logo from '../assets/icons/rc_logo.svg'
import { auth } from '../firebase-init';
import router from '../router';
import { LayoutDashboard, FileSearch2, Upload, MessageSquare, LogOut } from "lucide-vue-next";
import { useChatUnreadCount } from '../composables/useChatUnreadCount';

const { unreadChatCount } = useChatUnreadCount();

const logout = async () => {
  try {
    await signOut(auth);
    await router.push('/login');
  } catch {}
};
</script>
<template>
    <div class="sidebar">
        <div class="sidebar-items">
            <div class="sidebar-group">
                <div class="sidebar-item">
                    <img :src="logo" alt="ReadCycle" class="sidebar-logo" />
                    <h1 class="sidebar-text sidebar-header-text">ReadCycle</h1>
                </div>
            </div>
            <div class="sidebar-group">
                    <router-link to="/dashboard" class="sidebar-item" active-class="active-link" exact>
                      <LayoutDashboard></LayoutDashboard>
                      <p class="sidebar-text">Dashboard</p>
                    </router-link>                
                    <router-link to="/browse" class="sidebar-item" active-class="active-link" exact>
                      <FileSearch2></FileSearch2>
                      <p class="sidebar-text">Browse Books</p>
                    </router-link>                   
                    <router-link to="/upload" class="sidebar-item" active-class="active-link" exact>
                      <Upload></Upload>
                      <p class="sidebar-text">Upload Books</p>
                    </router-link>                   
                    <router-link to="/chats" class="sidebar-item" active-class="active-link" exact>
                      <span class="sidebar-icon-wrap">
                        <MessageSquare></MessageSquare>
                        <span v-if="unreadChatCount" class="sidebar-badge">{{ unreadChatCount > 9 ? '9+' : unreadChatCount }}</span>
                      </span>
                      <p class="sidebar-text">Chats</p>
                    </router-link>                   
            </div>
            <div class="sidebar-group">
                <label class="sidebar-label">Tools</label>
                <div class="sidebar-item" @click="logout">
                  <LogOut></LogOut>
                  <p class="sidebar-text">Log Out</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.sidebar {
  @extend %centered;
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100px;
  background-color: $color-background-secondary;
  flex-direction: column;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  overflow: hidden;
  transition: width 0.3s ease;
  z-index: 10;

  .sidebar-items {
    @extend %filler;
    position: relative;
    border-radius: inherit;

    .sidebar-group {
      width: 100%;
      padding-top: 18px;
      padding-left: 18px;
      padding-right: 18px;

      &:last-child {
        position: absolute;
        bottom: 0;
      }

      .sidebar-label {
        font-family: 'Nunito';
        font-weight: 500;
        color: #6c757d;
        opacity: 0;
        white-space: nowrap;
        transition: opacity 0.2s ease;
      }

      .sidebar-item {
        display: flex;
        align-items: center;
        column-gap: 15px;
        list-style-type: none;
        width: 100%;
        padding: 18px;
        cursor: pointer;
        color: $color-text;
        text-decoration: none;

        &:hover {
          svg {
            color: $color-primary-darkened;
          }
        }

        svg {
          flex-shrink: 0;
          transition: color 1s ease-in-out;
          color: lightgrey;
          width: 25px;
          aspect-ratio: 1/1;
        }

        .sidebar-icon-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-badge {
          position: absolute;
          top: -0.3rem;
          right: -0.55rem;
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

        .sidebar-text {
          display: flex;
          flex: 0 1 auto;
          align-content: center;
          column-gap: 10px;
          font-family: 'Nunito';
          font-weight: 250;
          overflow: hidden;
          white-space: nowrap;
          color: $color-text;
          text-decoration: none;
        }
      }

      .sidebar-logo {
        width: 25px;
        height: 25px;
        flex-shrink: 0;
      }

      .sidebar-header-text {
        font-family: 'Manrope';
        font-weight: 400;
        color: $color-accent;
      }
    }
  }

  &:hover {
    width: 300px;
  }
}
</style>
