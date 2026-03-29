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

function openFilePicker() {
  fileInput.value?.click()
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
      @change="onFileChange"
      :multiple="props.multiple"
      style="display: none"
    />
    <div class="inset-container">
      <div class="uploader-image-container">
        <div class="uploader-image"></div>
        <div class="addFile"></div>
        <div class="note"></div>
      </div>
      <div class="uploader-text">
        <h3>Drop your image<span v-if="multiple">s</span> here</h3>
        <div class="divider-container">
          <hr />or<hr />
        </div>
        <h3 class="browse-link" @click="openFilePicker">browse</h3>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.addFile,
.note {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.uploader-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    .inset-container {
        width: 90%;
        height: 90%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px dashed lightgray;
        border-radius: 20px;
        transition: border-color 1s ease, background 1s ease, transform 1s ease;
        cursor: pointer;
        &:hover {
            background-color: transparentize($color: $color-primary, $amount: 0.9);
            border-color: $color-accent;
            transform: scale(1.01);
            .addFile,
            .note {
              opacity: 1;
              transform: translateY(0);
            }
        }
    }
    .uploader-image-container {
        width: 35%;
        height: 100%;
        position: relative;

        .uploader-image {
            width: 100%;
            height: 100%;
            background-image: url(../assets/images/uploadHolding.svg);
            background-size: 70% 70%;
            background-position: center center;
            background-repeat: no-repeat;
        }
        .addFile {
            position: absolute;
            top: 0%;
            left: 3%;
            width: 35%;
            aspect-ratio: 1/1;
            background-image: url(../assets/images/addFiles.svg);
            background-size: 90% 90%;
            background-repeat: no-repeat;
            background-position: center center;
        }
        .note {
            position: absolute;
            bottom: 11%;
            right: 14%;
            width: 20%;
            aspect-ratio: 1/1;
            background-image: url(../assets/images/File.svg);
            background-size: 90% 90%;
            background-repeat: no-repeat;
            background-position: center center;
        }
    }
    .uploader-text {
        padding: 10px;
        width: 65%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        row-gap: 5px;
        h3 {
            color: $color-accent;
            font-family: 'Manrope';
        }
        p {
            font-family: 'Nunito';
        }
        .divider-container {
            display: flex;
            align-items: center;
            justify-content: center;
            column-gap: 10px;
            width: 100%;
            font-weight: 100;
            font-family: 'Nunito';
            hr {
                width: 100%;
                height: 1px;
                margin-top: px-to-vw(2.5);
                opacity: 0.5;
            }
        }
        .browse-link {
          text-decoration: none;
          position: relative;
          color: $color-accent;
          box-shadow: inset 0 -2px 0 0 $color-accent;
          transition: box-shadow 0.3s ease;
        
          &:hover {
            box-shadow: inset 0 -4px 0 0 $color-accent;
          }
        }
    }
}
@media screen and (min-width: 1025px) {
  .uploader-text {
    h3 {
      font-size: px-to-vw(20);
    }
    p {
      font-size: px-to-vw(15);
    }
  }
  .divider-container {
    font-size: px-to-vw(14);
  }
  .inset-container {
    height: 90%;
  }
}
@media screen and (max-width: 1025px) {
  .uploader-text {
    h3 {
      font-size: px-to-vw(30);
    }
    p {
      font-size: px-to-vw(26);
    }
  }
  .divider-container {
    font-size: px-to-vw(30);
  }
}
@media screen and (max-width: 950px) {
  .uploader-text {
    h3 {
      font-size: px-to-vw(50);
    }
    p {
      font-size: px-to-vw(26);
    }
  }
  .divider-container {
    font-size: px-to-vw(30);
  }
}
@media screen and (max-width: 550px) {
  .uploader-text {
    h3 {
      font-size: px-to-vw(60);
    }
    p {
      font-size: px-to-vw(30);
    }
  }
  .divider-container {
    font-size: px-to-vw(32);
  }
}
</style>