<script setup>
import { LayoutDashboard, FileSearch2, Upload, MessageSquare } from "lucide-vue-next";
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
              <MessageSquare></MessageSquare>
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
    height: var(--mobile-bottom-nav-height);
    padding-bottom: env(safe-area-inset-bottom);
    background-color: $color-background-secondary;
    z-index: 999;
    .navbar-wrapper {
        @extend %filler;
        display: flex;
        .navbar-item {
            flex: 1;
            @extend %centered;
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
</style>
