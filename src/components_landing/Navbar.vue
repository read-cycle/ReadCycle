<script setup lang="ts">
import { ref } from 'vue'
import logo from '@/assets/icons/rc_logo.svg'

const menuOpen = ref(false)

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <header class="landing-navbar">
    <div class="navbar-inner">
      <a href="#" class="brand" @click="closeMenu">
        <span class="brand-mark">
          <img :src="logo" alt="ReadCycle logo">
        </span>
        <span class="brand-copy">
          <span class="brand-kicker">ReadCycle</span>
          <span class="brand-subtitle">Student book exchange</span>
        </span>
      </a>

      <nav class="desktop-nav" aria-label="Primary">
        <a href="#" class="nav-link">Home</a>
        <a href="#about-us" class="nav-link">About</a>
        <a href="#how-it-works" class="nav-link">How It Works</a>
        <a href="#contact-us" class="nav-link">Contact</a>
      </nav>

      <div class="desktop-actions">
        <router-link to="/login" class="cta-link">Login</router-link>
      </div>

      <button
        type="button"
        class="menu-toggle"
        :aria-expanded="menuOpen"
        aria-label="Toggle navigation menu"
        @click="menuOpen = !menuOpen"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <transition name="menu-fade">
      <div v-if="menuOpen" class="mobile-panel">
        <nav class="mobile-nav" aria-label="Mobile">
          <a href="#" class="mobile-link" @click="closeMenu">Home</a>
          <a href="#about-us" class="mobile-link" @click="closeMenu">About</a>
          <a href="#how-it-works" class="mobile-link" @click="closeMenu">How It Works</a>
          <a href="#contact-us" class="mobile-link" @click="closeMenu">Contact</a>
          <router-link to="/login" class="mobile-cta" @click="closeMenu">Login</router-link>
        </nav>
      </div>
    </transition>
  </header>
</template>

<style lang="scss" scoped>
.landing-navbar {
  --max-width: 84rem;
  --accent-color: #1c6758;
  --muted-text: #5d7069;
  --surface-color: rgba(255, 255, 255, 0.82);
  --surface-border: rgba(28, 103, 88, 0.12);
  --transition-speed: 220ms;

  position: fixed;
  top: 0;
  left: 0;
  z-index: 30;
  width: 100%;
  padding: 0.9rem 1rem;
}

.navbar-inner {
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0.75rem 1rem;
  border-radius: 1.5rem;
  border: 1px solid var(--surface-border);
  background: var(--surface-color);
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 38px rgba(28, 103, 88, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand {
  min-height: 44px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
}

.brand-mark {
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(38, 229, 188, 0.18), rgba(129, 241, 217, 0.32));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 2.2rem;
    height: 2.2rem;
    object-fit: contain;
  }
}

.brand-copy {
  display: grid;
}

.brand-kicker {
  font-family: 'Manrope';
  font-size: 1rem;
  font-weight: 800;
  color: var(--accent-color);
}

.brand-subtitle {
  font-family: 'Nunito';
  font-size: 0.88rem;
  color: var(--muted-text);
}

.desktop-nav,
.desktop-actions {
  display: none;
}

.menu-toggle {
  width: 2.9rem;
  height: 2.9rem;
  min-width: 44px;
  min-height: 44px;
  margin-left: auto;
  border: 1px solid rgba(28, 103, 88, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.8);
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.26rem;
  cursor: pointer;

  span {
    width: 1rem;
    height: 2px;
    border-radius: 999px;
    background: var(--accent-color);
  }
}

.mobile-panel {
  width: 100%;
  max-width: var(--max-width);
  margin: 0.75rem auto 0;
  padding: 0 0.15rem;
}

.mobile-nav {
  padding: 0.75rem;
  border-radius: 1.5rem;
  border: 1px solid var(--surface-border);
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 38px rgba(28, 103, 88, 0.08);
  display: grid;
  gap: 0.5rem;
}

.mobile-link,
.mobile-cta,
.nav-link,
.cta-link {
  min-height: 44px;
  text-decoration: none;
  font-family: 'Nunito';
  font-size: 0.98rem;
  font-weight: 800;
}

.mobile-link {
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  color: var(--accent-color);

  &:hover {
    background: rgba(38, 229, 188, 0.08);
  }
}

.mobile-cta,
.cta-link {
  padding: 0.9rem 1.25rem;
  border-radius: 999px;
  color: var(--accent-color);
  background: linear-gradient(135deg, rgba(38, 229, 188, 0.9), rgba(129, 241, 217, 0.92));
  box-shadow: 0 12px 26px rgba(28, 103, 88, 0.14);
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition:
    opacity var(--transition-speed) ease,
    transform var(--transition-speed) ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (min-width: 900px) {
  .desktop-nav,
  .desktop-actions {
    display: flex;
  }

  .desktop-nav {
    margin-left: auto;
    align-items: center;
    gap: 0.35rem;
  }

  .desktop-actions {
    align-items: center;
  }

  .nav-link {
    padding: 0.75rem 1rem;
    border-radius: 999px;
    color: var(--muted-text);
    transition:
      background-color var(--transition-speed) ease,
      color var(--transition-speed) ease;

    &:hover {
      color: var(--accent-color);
      background: rgba(38, 229, 188, 0.08);
    }
  }

  .cta-link {
    margin-left: 0.5rem;
  }

  .menu-toggle,
  .mobile-panel {
    display: none;
  }
}

@media (max-width: 520px) {
  .brand-subtitle {
    display: none;
  }
}
</style>
