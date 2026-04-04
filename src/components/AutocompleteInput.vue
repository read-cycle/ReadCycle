<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';

defineOptions({
  inheritAttrs: false
});

const props = withDefaults(defineProps<{
  modelValue: string;
  options: string[];
  maxOptions?: number;
  minChars?: number;
  valid?: boolean;
  invalid?: boolean;
}>(), {
  maxOptions: 8,
  minChars: 1,
  valid: false,
  invalid: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  input: [value: string];
  blur: [];
  'option-select': [value: string];
}>();

const attrs = useAttrs();
const isFocused = ref(false);

const suggestions = computed(() => {
  const query = props.modelValue.trim().toLowerCase();
  if (!isFocused.value || query.length < props.minChars) return [];

  const startsWithMatches: string[] = [];
  const includesMatches: string[] = [];

  props.options.forEach((option) => {
    const normalizedOption = option.toLowerCase();
    if (normalizedOption === query) return;
    if (normalizedOption.startsWith(query)) {
      startsWithMatches.push(option);
      return;
    }
    if (normalizedOption.includes(query)) {
      includesMatches.push(option);
    }
  });

  return [...startsWithMatches, ...includesMatches].slice(0, props.maxOptions);
});

function handleInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  emit('update:modelValue', value);
  emit('input', value);
}

function handleFocus() {
  isFocused.value = true;
}

function handleBlur() {
  window.setTimeout(() => {
    isFocused.value = false;
    emit('blur');
  }, 120);
}

function selectOption(option: string) {
  emit('update:modelValue', option);
  emit('option-select', option);
  isFocused.value = false;
}
</script>

<template>
  <div class="autocomplete-input">
    <input
      v-bind="attrs"
      :value="modelValue"
      :class="{
        'is-valid': valid,
        'is-invalid': invalid
      }"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <div v-if="suggestions.length" class="autocomplete-input__menu">
      <button
        v-for="option in suggestions"
        :key="option"
        type="button"
        class="autocomplete-input__option"
        @mousedown.prevent="selectOption(option)"
      >
        {{ option }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.autocomplete-input {
  position: relative;
}

.autocomplete-input input {
  width: 100%;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 12px;
  padding: 0.75rem;
  background: $color-background-secondary;
  color: $color-text;
  font: inherit;
}

.autocomplete-input input.is-valid {
  border-color: #18cda6;
}

.autocomplete-input input.is-invalid {
  border-color: #dc2626;
}

.autocomplete-input__menu {
  position: absolute;
  top: calc(100% + 0.35rem);
  left: 0;
  right: 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  max-height: 16rem;
  overflow-y: auto;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 12px;
  background: $color-background-secondary;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.14);
}

.autocomplete-input__option {
  min-width: 0;
  padding: 0.7rem 0.85rem;
  border: none;
  background: transparent;
  text-align: left;
  font: inherit;
  color: inherit;
  cursor: pointer;
}

.autocomplete-input__option + .autocomplete-input__option {
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.autocomplete-input__option:hover,
.autocomplete-input__option:focus-visible {
  background: rgba(15, 23, 42, 0.05);
  outline: none;
}
</style>
