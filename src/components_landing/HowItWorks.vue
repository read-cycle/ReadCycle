<script setup lang="ts">
import { computed, ref } from 'vue'
import browseImage from '@/assets/images/browse2.svg'
import chatsImage from '@/assets/images/chats.svg'
import exchangeImage from '@/assets/images/exchange.svg'
import scanImage from '@/assets/images/scan.svg'

type FlowMode = 'browser' | 'uploader'

type FlowStep = {
  number: string
  title: string
  description: string
  image: string
  imagePosition?: string
  imageSize?: string
}

const activeMode = ref<FlowMode>('browser')

const browserFlow: FlowStep[] = [
  {
    number: '01',
    title: 'Find your book',
    description: "Browse listings and find something you'd like to read.",
    image: browseImage,
    imagePosition: 'center 32.5%',
    imageSize: '200% 200%'
  },
  {
    number: '02',
    title: 'Request & arrange',
    description: "Send a request to the uploader. Once they accept, chat to schedule how you'll exchange the book.",
    image: chatsImage,
    imagePosition: 'center 50%',
    imageSize: '125% 125%'
  },
  {
    number: '03',
    title: 'Exchange books',
    description: 'Swap books via meetup or delivery, and keep the story moving.',
    image: exchangeImage,
    imagePosition: 'center 22.5%',
    imageSize: '250% 250%'
  }
]

const uploaderFlow: FlowStep[] = [
  {
    number: '01',
    title: 'List your book',
    description: 'Fill out a short form on the Upload page with details and photos of your book.',
    image: scanImage,
    imagePosition: 'center 25%',
    imageSize: '175% 175%'
  },
  {
    number: '02',
    title: 'Accept & arrange',
    description: 'When a reader requests your book, review and accept. Then chat with them to sort out the exchange.',
    image: chatsImage,
    imagePosition: 'center 50%',
    imageSize: '125% 125%'
  },
  {
    number: '03',
    title: 'Exchange books',
    description: 'Hand off the book and check in to make sure the reader got what they needed.',
    image: exchangeImage,
    imagePosition: 'center 22.5%',
    imageSize: '250% 250%'
  }
]

const activeSteps = computed(() => (activeMode.value === 'browser' ? browserFlow : uploaderFlow))
const indicatorStyle = computed(() => ({
  transform: activeMode.value === 'browser' ? 'translateX(0%)' : 'translateX(100%)'
}))
</script>

<template>
  <section id="how-it-works" class="how-it-works-section" aria-labelledby="how-it-works-heading">
    <div class="section-inner">
      <div class="copy-block">
        <p class="section-kicker">How It Works</p>
        <h2 id="how-it-works-heading">ReadCycle Journey</h2>
        <p class="section-subheading">ReadCycle makes exchanging books simple for everyone.</p>
      </div>

      <div class="toggle" role="tablist" aria-label="Choose your ReadCycle flow">
        <span class="toggle-indicator" :style="indicatorStyle" aria-hidden="true"></span>
        <button
          type="button"
          class="toggle-option"
          :class="{ active: activeMode === 'browser' }"
          role="tab"
          :aria-selected="activeMode === 'browser'"
          @click="activeMode = 'browser'"
        >
          I'm Looking for a Book
        </button>
        <button
          type="button"
          class="toggle-option"
          :class="{ active: activeMode === 'uploader' }"
          role="tab"
          :aria-selected="activeMode === 'uploader'"
          @click="activeMode = 'uploader'"
        >
          I Want to List a Book
        </button>
      </div>

      <Transition name="flow-switch" mode="out-in">
        <ol :key="activeMode" class="steps-timeline">
          <li v-for="step in activeSteps" :key="step.number" class="timeline-step">
            <div class="step-badge">{{ step.number }}</div>

            <div class="step-content">
              <div
                class="step-illustration"
                :style="{
                  backgroundImage: `url(${step.image})`,
                  backgroundPosition: step.imagePosition || 'center',
                  backgroundSize: step.imageSize || 'cover'
                }"
              ></div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </div>
          </li>
        </ol>
      </Transition>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.how-it-works-section {
  --section-max-width: 84rem;
  --section-padding-inline: clamp(1rem, 4vw, 2.5rem);
  --section-padding-block: clamp(4rem, 9vw, 6.5rem);
  --radius-xl: 1.75rem;
  --radius-lg: 1.25rem;
  --text-color: #2b2b2b;
  --muted-text: #536861;
  --accent-color: #1c6758;
  --accent-soft: #26e5bc;
  --surface-color: rgba(255, 255, 255, 0.88);
  --surface-outline: rgba(28, 103, 88, 0.12);
  --line-color: rgba(28, 103, 88, 0.18);
  --placeholder-background: rgba(28, 103, 88, 0.06);
  --transition-speed: 260ms;

  width: 100%;
  padding: var(--section-padding-block) var(--section-padding-inline);
  color: var(--text-color);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(129, 241, 217, 0.12)),
    radial-gradient(circle at 20% 20%, rgba(38, 229, 188, 0.12), transparent 28%);
}

.section-inner {
  width: 100%;
  max-width: var(--section-max-width);
  margin: 0 auto;
}

.copy-block {
  max-width: 38rem;
  margin-bottom: 1.5rem;

  h2 {
    margin: 0.25rem 0 0.5rem;
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

.section-subheading {
  margin: 0;
  font-family: 'Nunito';
  font-size: 1rem;
  line-height: 1.7;
  color: var(--muted-text);
}

.toggle {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: center;
  width: 100%;
  max-width: 42rem;
  min-height: 3.5rem;
  padding: 0.35rem;
  margin-bottom: 2rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(28, 103, 88, 0.1);
  box-shadow: 0 16px 34px rgba(28, 103, 88, 0.08);
}

.toggle-indicator {
  position: absolute;
  top: 0.35rem;
  left: 0.35rem;
  width: calc(50% - 0.35rem);
  height: calc(100% - 0.7rem);
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(38, 229, 188, 0.92), rgba(129, 241, 217, 0.92));
  box-shadow: 0 10px 25px rgba(28, 103, 88, 0.16);
  transition: transform var(--transition-speed) ease;
}

.toggle-option {
  position: relative;
  z-index: 1;
  min-height: 44px;
  padding: 0.85rem 1rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  font-family: 'Nunito';
  font-size: 0.98rem;
  font-weight: 800;
  color: var(--muted-text);
  cursor: pointer;
  transition: color var(--transition-speed) ease;

  &.active {
    color: var(--accent-color);
  }
}

.steps-timeline {
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 2rem;

  &::before {
    content: '';
    position: absolute;
    left: 1rem;
    top: 1rem;
    bottom: 1rem;
    width: 2px;
    background: linear-gradient(180deg, rgba(38, 229, 188, 0.2), var(--line-color), rgba(38, 229, 188, 0.2));
  }
}

.timeline-step {
  position: relative;
  padding-left: 3.75rem;
}

.step-badge {
  position: absolute;
  left: 0;
  top: 0.25rem;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent-color), #2ca28c);
  color: #ffffff;
  font-family: 'Manrope';
  font-size: 0.85rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 18px rgba(28, 103, 88, 0.2);
}

.step-content {
  display: grid;
  gap: 0.9rem;
  padding: 1rem;
  border-radius: var(--radius-xl);
  background: var(--surface-color);
  border: 1px solid var(--surface-outline);
  box-shadow: 0 18px 40px rgba(28, 103, 88, 0.08);

  h3 {
    margin: 0;
    font-family: 'Manrope';
    font-size: 1.15rem;
    color: var(--accent-color);
  }

  p {
    margin: 0;
    font-family: 'Nunito';
    font-size: 1rem;
    line-height: 1.65;
    color: var(--muted-text);
  }
}

.step-illustration {
  width: 100%;
  min-height: 160px;
  border-radius: var(--radius-lg);
  border: 2px solid rgba(28, 103, 88, 0.18);
  background-color: rgba(28, 103, 88, 0.08);
  background-size: cover;
  background-repeat: no-repeat;
  box-shadow: inset 0 0 0 1px rgba(28, 103, 88, 0.1);
}

.flow-switch-enter-active,
.flow-switch-leave-active {
  transition:
    opacity var(--transition-speed) ease,
    transform var(--transition-speed) ease;
}

.flow-switch-enter-from,
.flow-switch-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (min-width: 768px) {
  .toggle {
    margin-bottom: 3rem;
  }

  .steps-timeline {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.5rem;
    padding-top: 5rem;

    &::before {
      left: 8%;
      right: 8%;
      top: 6rem;
      bottom: auto;
      width: auto;
      height: 2px;
      background: linear-gradient(90deg, rgba(38, 229, 188, 0.25), var(--line-color), rgba(38, 229, 188, 0.25));
    }
  }

  .timeline-step {
    padding-left: 0;
    padding-top: 0;
  }

  .step-badge {
    left: 50%;
    top: 5rem;
    transform: translateX(-50%);
    width: 2.5rem;
    height: 2.5rem;
    font-size: 0.95rem;
  }

  .step-content {
    padding: 0;
    background: transparent;
    border: 0;
    box-shadow: none;
    text-align: center;
  }

  .step-illustration {
    order: -1;
  }
}

@media (max-width: 767px) {
  .toggle {
    max-width: none;
  }

  .toggle-option {
    font-size: 0.92rem;
    padding-inline: 0.7rem;
  }
}
</style>
