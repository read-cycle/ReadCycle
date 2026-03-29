<template>
    <div class="navbar-container">
        <ul class="navbar-wrapper">
            <router-link to="/dashboard" class="navbar-item" active-class="active-link" exact>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-dashboard-icon lucide-layout-dashboard"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            </router-link>  
            <router-link to="/browse" class="navbar-item" active-class="active-link" exact>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-search2-icon lucide-file-search-2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><circle cx="11.5" cy="14.5" r="2.5"/><path d="M13.3 16.3 15 18"/></svg>
            </router-link>  
            <router-link to="/upload" class="navbar-item" active-class="active-link" exact>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload-icon lucide-upload"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
            </router-link>  
            <router-link to="/chats" class="navbar-item" active-class="active-link" exact>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-icon lucide-message-square"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/></svg>
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
    height: 5vh;
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