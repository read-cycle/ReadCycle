<script setup lang="ts">
import Quagga from '@ericblade/quagga2';
import ISBN from 'isbn-utils';
import { nextTick, onBeforeUnmount, ref } from 'vue';

const emit = defineEmits<{
  detected: [isbn: string];
}>();

const scannerRef = ref<HTMLDivElement | null>(null);
const isStarting = ref(false);
const isScanning = ref(false);
const showViewport = ref(false);
const errorMessage = ref('');

let detectorAttached = false;

function normalizeIsbn(value: string) {
  const cleaned = value.replace(/[^0-9Xx]/g, '').toUpperCase();

  if ((cleaned.length === 10 || cleaned.length === 13) && ISBN.isValid(cleaned)) {
    return cleaned;
  }

  return null;
}

function stopScanner() {
  if (detectorAttached) {
    Quagga.offDetected(handleDetected);
    detectorAttached = false;
  }

  if (isScanning.value) {
    Quagga.stop();
    isScanning.value = false;
  }

  showViewport.value = false;
}

function handleDetected(result: { codeResult?: { code?: string; }; }) {
  const code = result.codeResult?.code;
  if (!code) return;

  const isbn = normalizeIsbn(code);
  if (!isbn) return;

  stopScanner();
  emit('detected', isbn);
}

async function startScanner() {
  if (isStarting.value || isScanning.value) return;

  errorMessage.value = '';
  isStarting.value = true;
  showViewport.value = true;

  await nextTick();

  if (!scannerRef.value) {
    errorMessage.value = 'Scanner could not start.';
    isStarting.value = false;
    showViewport.value = false;
    return;
  }

  Quagga.init(
    {
      inputStream: {
        type: 'LiveStream',
        target: scannerRef.value,
        constraints: {
          facingMode: 'environment'
        }
      },
      decoder: {
        readers: ['ean_reader', 'code_39_reader']
      },
      locate: true
    },
    (error) => {
      isStarting.value = false;

      if (error) {
        console.error('Quagga init failed:', error);
        errorMessage.value = 'Camera access failed. Check browser permissions and try again.';
        showViewport.value = false;
        return;
      }

      if (!detectorAttached) {
        Quagga.onDetected(handleDetected);
        detectorAttached = true;
      }

      Quagga.start();
      isScanning.value = true;
    }
  );
}

function toggleScanner() {
  if (isScanning.value) {
    stopScanner();
    return;
  }

  void startScanner();
}

onBeforeUnmount(() => {
  stopScanner();
});
</script>

<template>
  <section class="isbn-scanner">
    <button
      type="button"
      class="isbn-scanner__button"
      :disabled="isStarting"
      @click="toggleScanner"
    >
      {{ isScanning ? 'Stop ISBN scanner' : isStarting ? 'Starting scanner...' : 'Scan ISBN' }}
    </button>

    <p v-if="errorMessage" class="isbn-scanner__error">
      {{ errorMessage }}
    </p>

    <div v-show="showViewport" ref="scannerRef" class="isbn-scanner__viewport" />
  </section>
</template>

<style scoped lang="scss">
.isbn-scanner {
  display: grid;
  gap: 0.75rem;
}

.isbn-scanner__button {
  width: fit-content;
  border: 0;
  border-radius: 999px;
  padding: 0.85rem 1.2rem;
  background: $color-primary;
  color: white;
  font: 700 0.95rem 'Nunito';
  cursor: pointer;
}

.isbn-scanner__button:disabled {
  opacity: 0.7;
  cursor: progress;
}

.isbn-scanner__error {
  margin: 0;
  color: #b91c1c;
  font: 600 0.9rem 'Nunito';
}

.isbn-scanner__viewport {
  overflow: hidden;
  width: min(100%, 28rem);
  min-height: 18rem;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 18px;
  background: #0f172a;
}

.isbn-scanner__viewport :deep(video),
.isbn-scanner__viewport :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
