<script setup lang="ts">
import { ref, computed, defineEmits } from 'vue';
import { X, Eye, EyeClosed } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const props = defineProps<{
  modelValue: string,
  fieldName: string,
  placeholder?: string,
  fieldIcon?: string,
  fieldType?: 'text' | 'password' | 'email'
}>()

const passwordHidden = ref(true)
const inputRef = ref<HTMLInputElement | null>(null)

const isPassword = computed(() => props.fieldType === 'password')

const inputType = computed(() => {
  if (isPassword.value) return 'password'
  return props.fieldType || 'text'
})

function clearInput() {
  if (inputRef.value) {
    inputRef.value.value = ""
    emit('update:modelValue', "")
  }
}

const input_pwd = ref();
</script>
<template>
  <input
    id="invisible-sync-pwd"
    v-show="false"
    v-model="input_pwd"
    :type="passwordHidden ? 'text' : 'password'"
  >
  <div>
    <fieldset class="input-box-container">
      <legend>{{ fieldName }}</legend>

      <div class="input-icon-container" v-html="fieldIcon" />

      <input
        ref="inputRef"
        :type="inputType == 'password' && !passwordHidden ? 'text' : inputType"
        class="input-box"
        :placeholder="placeholder"
        :style="[
          { marginRight: isPassword ? '25%' : '15%' },
        ]"
        v-model="input_pwd"
        :value="modelValue"
        autocomplete="on"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />

      <div class="optional-buttons">
        <div class="optional-deleter" @click="clearInput">
          <X></X>
        </div>

        <div
          class="optional-hider"
          v-if="isPassword"
          @click="passwordHidden = !passwordHidden"
        >
          <EyeClosed v-if="passwordHidden" />
          <Eye v-else />
        </div>
      </div>
    </fieldset>
  </div>
</template>
<style lang="scss" scoped>
@media screen and (max-width: 850px) {
  .input-box {
    font-size: px-to-vw(40);
  }
  .input-box-container {
    height: px-to-vw(130);
    legend {
        font-size: px-to-vw(25);
        margin: px-to-vw(-12);
        margin-inline-start: px-to-vw(110);
    }
  }
}
@media screen and (max-width: 575px) {
  .input-box {
    font-size: px-to-vw(45);
  }
  .input-box-container {
    height: px-to-vw(140);
    legend {
        font-size: px-to-vw(25);
        margin: px-to-vw(-12);
        margin-inline-start: px-to-vw(110);
    }
  }
}
@media screen and (max-width: 500px) {
  .input-box {
    font-size: px-to-vw(45);
  }
  .input-box-container {
    height: px-to-vw(145);
    legend {
        font-size: px-to-vw(27.5);
        margin: px-to-vw(-12);
        margin-inline-start: px-to-vw(110);
    }
  }
}
@media screen and (min-width: 850px) {
  .input-box {
    font-size: px-to-vw(16);
  }
  .input-box-container {
    height: px-to-vw(55);
    legend {
        font-size: px-to-vw(10);
        margin: px-to-vw(-6);
        margin-inline-start: px-to-vw(55);
    }
  }
}
@keyframes subtleWiggle {
  0%, 100% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-1px);
  }
  75% {
    transform: translateY(1px);
  }
}
.input-box-container {
    position: relative;
    display: flex;
    font-family: 'Nunito';
    border-radius: 30px;
    border: 1px solid $color-accent;
    &:focus-within {
      box-shadow: 0 0 5px 2px rgba($color-accent-lightened, 0.5);
      :deep(.input-icon-container svg) {
        animation: subtleWiggle 5s ease-in-out infinite;
      }
    }
    legend {
        position: relative;
        z-index: 20;
    }
}
:deep(.input-icon-container) {
    aspect-ratio: 1/1;
    border-top-left-radius: 30px;
    border-bottom-left-radius: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 5px;
    border-right: 1px solid lightgray;
    svg {
        width: 50%;
        aspect-ratio: 1/1;
    }
}
.input-box {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;    
    border-top-right-radius: 30px;
    border-bottom-right-radius: 30px;
    padding-left: 5px;
}
.optional-buttons {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    right: 5%;
    top: 50%;
    transform: translateY(-50%);
    height: 50%;
    left: 75%;
    div {
        width: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        svg {
            width: 75%;
            transition: color 200ms ease-in-out;
        }
    }
    .optional-deleter {
        &:hover {
            color: red;
        }
    }
}
</style>
