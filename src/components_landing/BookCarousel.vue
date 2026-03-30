<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import type { FirestoreRecord } from '../composables/firestore'
import { subscribeToUploadPool } from '../composables/useUploadPool'
import type { UploadDoc } from '../interfaces'

const carouselRef = ref<HTMLElement | null>(null)
const isHovered = ref(false)
const isDragging = ref(false)
const loading = ref(true)
const loadError = ref(false)
const books = ref<FirestoreRecord<UploadDoc>[]>([])
const visibleBooks = computed(() => books.value.filter(([, book]) => book.quantity > 0))
const hasScrollableCarousel = computed(() => visibleBooks.value.length > 1)
const duplicatedBooks = computed(() => (
  hasScrollableCarousel.value
    ? [...visibleBooks.value, ...visibleBooks.value]
    : visibleBooks.value
))
const DRAG_SENSITIVITY = 0.7

let scrollInterval: number | null = null
let resumeTimeout: number | null = null
let unsubscribe: (() => void) | null = null
let activePointerId: number | null = null
let dragStartX = 0
let dragStartScrollLeft = 0

function setScrollLeftInstant(carousel: HTMLElement, left: number) {
  const previousScrollBehavior = carousel.style.scrollBehavior
  const previousScrollSnapType = carousel.style.scrollSnapType

  carousel.style.scrollBehavior = 'auto'
  carousel.style.scrollSnapType = 'none'
  carousel.scrollLeft = left

  requestAnimationFrame(() => {
    carousel.style.scrollBehavior = previousScrollBehavior
    carousel.style.scrollSnapType = previousScrollSnapType
  })
}

function getBookSubtitle(book: UploadDoc) {
  return [book.grade, book.subject].filter(Boolean).join(' • ') || 'Available now'
}

function getBookMeta(book: UploadDoc) {
  const parts = [`Qty ${book.quantity ?? 0}`]
  if (book.price > 0) parts.push(`₹${book.price}`)
  return parts.join(' • ')
}

function getLoopWidth() {
  const carousel = carouselRef.value
  if (!carousel || !hasScrollableCarousel.value) return 0
  return carousel.scrollWidth / 2
}

function normalizeScroll() {
  const carousel = carouselRef.value
  if (!carousel) return

  const loopWidth = getLoopWidth()
  if (!loopWidth) return

  if (carousel.scrollLeft < loopWidth * 0.5) {
    setScrollLeftInstant(carousel, carousel.scrollLeft + loopWidth)
  } else if (carousel.scrollLeft >= loopWidth * 1.5) {
    setScrollLeftInstant(carousel, carousel.scrollLeft - loopWidth)
  }
}

function stepAutoScroll() {
  const carousel = carouselRef.value
  if (!carousel || isHovered.value || isDragging.value || !hasScrollableCarousel.value) return

  normalizeScroll()
  carousel.scrollLeft += 1
}

function startAutoScroll() {
  if (scrollInterval !== null) return
  scrollInterval = window.setInterval(stepAutoScroll, 24)
}

function stopAutoScroll() {
  if (scrollInterval === null) return
  window.clearInterval(scrollInterval)
  scrollInterval = null
}

function clearResumeTimeout() {
  if (resumeTimeout === null) return
  window.clearTimeout(resumeTimeout)
  resumeTimeout = null
}

function scheduleAutoScrollResume(delay = 900) {
  clearResumeTimeout()
  resumeTimeout = window.setTimeout(() => {
    isHovered.value = false
    startAutoScroll()
  }, delay)
}

function pauseScroll() {
  isHovered.value = true
  clearResumeTimeout()
  stopAutoScroll()
}

function resumeScroll() {
  if (isDragging.value) return
  scheduleAutoScrollResume(250)
}

function recenterCarousel() {
  const carousel = carouselRef.value
  const loopWidth = getLoopWidth()
  if (!carousel || !loopWidth) return
  setScrollLeftInstant(carousel, loopWidth)
}

function getCardStep() {
  const carousel = carouselRef.value
  if (!carousel) return 300

  const card = carousel.querySelector<HTMLElement>('.book-card')
  if (!card) return Math.max(carousel.clientWidth * 0.82, 280)

  const cardStyles = window.getComputedStyle(card)
  const gap = Number.parseFloat(cardStyles.marginRight) || 0
  const trackStyles = window.getComputedStyle(carousel)
  const columnGap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap) || 0

  return card.getBoundingClientRect().width + gap + columnGap
}

function scrollByCard(direction: 1 | -1) {
  const carousel = carouselRef.value
  if (!carousel || !hasScrollableCarousel.value) return

  pauseScroll()
  normalizeScroll()

  carousel.scrollTo({
    left: carousel.scrollLeft + getCardStep() * direction,
    behavior: 'smooth'
  })

  window.setTimeout(() => {
    normalizeScroll()
  }, 360)

  scheduleAutoScrollResume(1600)
}

function handlePointerDown(event: PointerEvent) {
  const carousel = carouselRef.value
  if (!carousel || !hasScrollableCarousel.value) return
  if (event.pointerType === 'mouse' && event.button !== 0) return

  activePointerId = event.pointerId
  dragStartX = event.clientX
  dragStartScrollLeft = carousel.scrollLeft
  isDragging.value = true
  pauseScroll()

  carousel.setPointerCapture(event.pointerId)
}

function handlePointerMove(event: PointerEvent) {
  const carousel = carouselRef.value
  if (!carousel || activePointerId !== event.pointerId || !isDragging.value) return

  const previousScrollLeft = carousel.scrollLeft
  const deltaX = (event.clientX - dragStartX) * DRAG_SENSITIVITY

  carousel.scrollLeft = dragStartScrollLeft - deltaX
  normalizeScroll()
  dragStartScrollLeft += carousel.scrollLeft - previousScrollLeft
}

function handlePointerUp(event: PointerEvent) {
  if (activePointerId !== event.pointerId) return

  activePointerId = null
  isDragging.value = false
  normalizeScroll()
  scheduleAutoScrollResume(900)
}

onMounted(() => {
  unsubscribe = subscribeToUploadPool(
    (nextBooks) => {
      books.value = nextBooks
      loading.value = false
      loadError.value = false
      nextTick(() => {
        recenterCarousel()
      })
    },
    (error) => {
      console.error('Failed to subscribe to uploadPool:', error)
      loading.value = false
      loadError.value = true
    },
    8
  )

  nextTick(() => {
    recenterCarousel()
  })
  startAutoScroll()
})

onUnmounted(() => {
  unsubscribe?.()
  clearResumeTimeout()
  stopAutoScroll()
})
</script>

<template>
  <section class="book-carousel-section" aria-labelledby="books-available-heading">
    <div class="section-header">
      <div>
        <p class="section-kicker">Live from ReadCycle</p>
        <h2 id="books-available-heading">Books Available Now</h2>
      </div>

      <div class="nav-buttons" aria-label="Carousel navigation">
        <button type="button" class="nav-button" aria-label="Scroll left" :disabled="!hasScrollableCarousel" @click="scrollByCard(-1)">
          <span aria-hidden="true">←</span>
        </button>
        <button type="button" class="nav-button" aria-label="Scroll right" :disabled="!hasScrollableCarousel" @click="scrollByCard(1)">
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>

    <div
      v-if="duplicatedBooks.length"
      class="carousel-shell"
      @mouseenter="pauseScroll"
      @mouseleave="resumeScroll"
    >
      <div
        ref="carouselRef"
        class="carousel-track"
        :class="{ 'is-dragging': isDragging }"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointercancel="handlePointerUp"
      >
        <article
          v-for="([docRef, book], index) in duplicatedBooks"
          :key="`${docRef.id}-${index}`"
          class="book-card"
        >
          <div class="book-cover-wrap">
            <img v-if="book.listingImage" :src="book.listingImage" :alt="`Cover of ${book.title || 'book listing'}`" class="book-cover">
            <div v-else class="book-cover book-cover-fallback" aria-hidden="true">
              <span>{{ (book.title || 'R').slice(0, 1).toUpperCase() }}</span>
            </div>
          </div>

          <div class="book-card-content">
            <h3>{{ book.title || 'Untitled listing' }}</h3>
            <p class="book-author">{{ getBookSubtitle(book) }}</p>
            <p class="book-meta">{{ getBookMeta(book) }}</p>
          </div>
        </article>
      </div>
    </div>

    <div v-else class="carousel-empty-state">
      <p v-if="loading">Loading live listings...</p>
      <p v-else-if="loadError">Live listings are unavailable right now.</p>
      <p v-else>No books are currently available.</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.book-carousel-section {
  --section-max-width: 84rem;
  --section-padding-inline: clamp(1rem, 4vw, 2.5rem);
  --section-padding-block: clamp(3.5rem, 8vw, 6rem);
  --surface-color: rgba(255, 255, 255, 0.92);
  --surface-border: rgba(28, 103, 88, 0.12);
  --text-color: #2b2b2b;
  --muted-text: #4f655f;
  --accent-color: #1c6758;
  --accent-soft: #26e5bc;
  --shadow-color: 0 16px 40px rgba(28, 103, 88, 0.12);
  --radius-xl: 1.75rem;
  --radius-lg: 1.25rem;
  --card-width: clamp(16.5rem, 26vw, 18.5rem);
  --transition-speed: 220ms;

  width: 100%;
  padding: var(--section-padding-block) var(--section-padding-inline);
  background:
    radial-gradient(circle at top left, rgba(38, 229, 188, 0.18), transparent 34%),
    linear-gradient(180deg, rgba(129, 241, 217, 0.18), rgba(255, 255, 255, 0));
  color: var(--text-color);
}

.section-header {
  width: 100%;
  max-width: var(--section-max-width);
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;

  h2 {
    margin: 0.25rem 0 0;
    font-family: 'Manrope';
    font-size: clamp(2rem, 3vw, 3rem);
    line-height: 1.05;
    color: var(--accent-color);
  }
}

.section-kicker {
  margin: 0;
  font-family: 'Nunito';
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted-text);
}

.nav-buttons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-button {
  width: 3rem;
  height: 3rem;
  min-width: 44px;
  min-height: 44px;
  border: 1px solid rgba(28, 103, 88, 0.15);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: var(--accent-color);
  box-shadow: 0 10px 25px rgba(28, 103, 88, 0.1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    transform var(--transition-speed) ease,
    box-shadow var(--transition-speed) ease,
    background-color var(--transition-speed) ease,
    opacity var(--transition-speed) ease;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 10px 25px rgba(28, 103, 88, 0.1);
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 14px 28px rgba(28, 103, 88, 0.16);
    background-color: #ffffff;
  }

  span {
    font-size: 1.25rem;
    line-height: 1;
  }
}

.carousel-empty-state {
  width: 100%;
  max-width: var(--section-max-width);
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-xl);
  background: var(--surface-color);
  text-align: center;
  font-family: 'Nunito';
  color: var(--muted-text);
}

.carousel-shell {
  position: relative;
  width: 100%;
  max-width: var(--section-max-width);
  margin: 0 auto;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: clamp(2rem, 7vw, 5rem);
    pointer-events: none;
    z-index: 2;
  }

  &::before {
    left: 0;
    background: linear-gradient(90deg, rgba(246, 253, 251, 1), rgba(246, 253, 251, 0));
  }

  &::after {
    right: 0;
    background: linear-gradient(270deg, rgba(246, 253, 251, 1), rgba(246, 253, 251, 0));
  }
}

.carousel-track {
  display: flex;
  gap: 1.25rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding: 0.5rem 0 1rem;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  cursor: grab;

  &::-webkit-scrollbar {
    display: none;
  }

  &.is-dragging {
    cursor: grabbing;
    scroll-behavior: auto;
    scroll-snap-type: none;
  }
}

.book-card {
  flex: 0 0 var(--card-width);
  scroll-snap-align: start;
  border-radius: var(--radius-xl);
  background: var(--surface-color);
  border: 1px solid var(--surface-border);
  box-shadow: var(--shadow-color);
  overflow: hidden;
  transition:
    transform var(--transition-speed) ease,
    box-shadow var(--transition-speed) ease;
  user-select: none;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 18px 45px rgba(28, 103, 88, 0.18);
  }
}

.book-cover-wrap {
  aspect-ratio: 4 / 5;
  background: linear-gradient(135deg, rgba(129, 241, 217, 0.35), rgba(255, 255, 255, 0.8));
}

.book-cover {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
}

.book-cover-fallback {
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at top, rgba(38, 229, 188, 0.35), transparent 45%),
    linear-gradient(135deg, #cdeee8, #eef7f4);
  color: var(--accent-color);
  font-family: 'Manrope';
  font-size: 3rem;
  font-weight: 800;
}

.book-card-content {
  padding: 1rem 1rem 1.15rem;
  display: grid;
  gap: 0.35rem;

  h3 {
    margin: 0;
    font-family: 'Manrope';
    font-size: 1.1rem;
    line-height: 1.25;
    color: var(--accent-color);
  }
}

.book-author {
  margin: 0;
  font-family: 'Nunito';
  font-size: 0.98rem;
  color: var(--muted-text);
}

.book-meta {
  margin: 0.2rem 0 0;
  font-family: 'Nunito';
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--accent-color);
}

@media (max-width: 767px) {
  .section-header {
    margin-bottom: 1rem;
    align-items: start;
    flex-direction: column;
  }

  .nav-buttons {
    align-self: flex-end;
    gap: 0.5rem;
  }

  .nav-button {
    width: 2.75rem;
    height: 2.75rem;
  }

  .book-carousel-section {
    --card-width: min(88vw, 22rem);
  }

  .carousel-track {
    padding-bottom: 0.5rem;
  }
}
</style>
