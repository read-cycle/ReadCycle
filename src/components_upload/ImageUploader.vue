<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
    multiple: Boolean
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: File | null): void
  (e: 'update:modelValue', value: File[] | null): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const cameraInput = ref<HTMLInputElement | null>(null)

function openFilePicker() {
  fileInput.value?.click()
}

function openCameraPicker() {
  cameraInput.value?.click()
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (!files || files.length === 0) {
    emit('update:modelValue', props.multiple ? [] : null)
    return
  }

  if (props.multiple) {
    emit('update:modelValue', Array.from(files))
  } else {
    emit('update:modelValue', files[0])
  }
}
</script>
<template>
  <div class="uploader-container">
    <input
      type="file"
      ref="fileInput"
      accept="image/*"
      @change="onFileChange"
      :multiple="props.multiple"
      style="display: none"
    />
    <input
      v-if="!props.multiple"
      type="file"
      ref="cameraInput"
      accept="image/*"
      capture="environment"
      @change="onFileChange"
      style="display: none"
    />
    <button type="button" class="inset-container" @click="openFilePicker">
      <div class="uploader-image-container">
        <div class="uploader-image"></div>
        <div class="addFile"></div>
        <div class="note"></div>
      </div>
      <div class="uploader-text">
        <h3 class="uploader-title">Drop your image<span v-if="multiple">s</span> here</h3>
        <div class="divider-container">
          <hr />or<hr />
        </div>
        <div class="uploader-links">
          <p class="browse-link">browse</p>
          <p v-if="!props.multiple" class="browse-link" @click.stop="openCameraPicker">take a picture</p>
        </div>
      </div>
    </button>
  </div>
</template>
<style lang="scss" scoped>
.uploader-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inset-container {
  appearance: none;
  width: 90%;
  height: 90%;
  padding: 0;
  margin: 0;
  border: 3px dashed lightgray;
  border-radius: 20px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 1s ease, background 1s ease, transform 1s ease;
}

.inset-container:hover {
  background-color: transparentize($color: $color-primary, $amount: 0.9);
  border-color: $color-accent;
  transform: scale(1.01);
}

.inset-container:hover .addFile,
.inset-container:hover .note {
  opacity: 1;
  transform: translateY(0);
}

.inset-container:focus-visible {
  outline: 2px solid $color-accent;
  outline-offset: 3px;
}

.uploader-image-container {
  width: 35%;
  height: 100%;
  position: relative;
}

.uploader-image {
  width: 100%;
  height: 100%;
  background-image: url(../assets/images/uploadHolding.svg);
  background-size: 70% 70%;
  background-position: center center;
  background-repeat: no-repeat;
}

.addFile,
.note {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.addFile {
  position: absolute;
  top: 0%;
  left: 6%;
  width: 35%;
  aspect-ratio: 1 / 1;
  background-image: url(../assets/images/addFiles.svg);
  background-size: 90% 90%;
  background-repeat: no-repeat;
  background-position: center center;
}

.note {
  position: absolute;
  bottom: 11%;
  right: 19%;
  width: 20%;
  aspect-ratio: 1 / 1;
  background-image: url(../assets/images/File.svg);
  background-size: 90% 90%;
  background-repeat: no-repeat;
  background-position: center center;
}

.uploader-text {
  width: 65%;
  height: 100%;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.4rem;
  text-align: center;
}

.uploader-title {
  margin: 0;
  color: $color-accent;
  font-family: 'Manrope';
  font-weight: 700;
  line-height: 1.15;
  font-size: clamp(1rem, 1.6vw, 1.35rem);
}

.divider-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  color: $color-text-secondary;
  font-family: 'Nunito';
  font-size: clamp(0.78rem, 1.15vw, 0.92rem);
  font-weight: 600;
}

.divider-container hr {
  width: 100%;
  height: 1px;
  border: none;
  background: rgba(15, 23, 42, 0.16);
}

.uploader-links {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.browse-link {
  margin: 0;
  color: $color-accent;
  font-family: 'Nunito';
  font-weight: 700;
  line-height: 1.2;
  font-size: clamp(0.84rem, 1.2vw, 0.98rem);
  box-shadow: inset 0 -2px 0 0 $color-accent;
  cursor: pointer;
  transition: box-shadow 0.3s ease;
}

.browse-link:hover {
  box-shadow: inset 0 -4px 0 0 $color-accent;
}

@media screen and (max-width: 900px) {
  .uploader-title {
    font-size: clamp(1rem, 3.4vw, 1.25rem);
  }

  .browse-link {
    font-size: clamp(0.82rem, 2.7vw, 0.95rem);
  }

  .divider-container {
    font-size: clamp(0.76rem, 2.3vw, 0.9rem);
  }
}

@media screen and (max-width: 640px) {
  .inset-container {
    min-height: 220px;
  }

  .uploader-image-container {
    width: 40%;
  }

  .uploader-text {
    width: 60%;
    padding: 0.75rem 0.5rem;
  }
}

@media screen and (max-width: 520px) {
  .inset-container {
    flex-direction: column;
    justify-content: center;
    gap: 0.25rem;
    min-height: 260px;
    padding: 0.75rem;
  }

  .uploader-image-container {
    width: 100%;
    height: 130px;
  }

  .uploader-text {
    width: 100%;
    height: auto;
    padding: 0 0.25rem 0.25rem;
  }

  .uploader-title {
    font-size: clamp(0.98rem, 5vw, 1.18rem);
  }

  .browse-link {
    font-size: clamp(0.82rem, 4.1vw, 0.92rem);
  }

  .divider-container {
    font-size: clamp(0.74rem, 3.8vw, 0.84rem);
  }
}
</style>
