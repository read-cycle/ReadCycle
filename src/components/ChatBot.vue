<template>
  <div>
    <link
      rel="stylesheet"
      href="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/themes/df-messenger-default.css"
    />
    <df-messenger
      project-id="book-exchange-22dd2"
      agent-id="8e4d9b56-e1cd-47af-87d3-0cb0715c75d3"
      language-code="en"
      max-query-length="-1"
      allow-feedback="all"
    >
      <df-messenger-chat-bubble
        chat-title="ReadCycle Assistant"
        chat-title-icon="https://firebasestorage.googleapis.com/v0/b/book-exchange-22dd2.appspot.com/o/rc_logo.svg?alt=media&token=8ee884aa-03a5-473c-bdec-620dcad4cd27"
      />
    </df-messenger>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

onMounted(() => {
  if (!document.querySelector("#df-messenger-script")) {
    const script = document.createElement("script");
    script.id = "df-messenger-script";
    script.src =
      "https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js";
    document.head.appendChild(script);
  }
});
</script>

<style>
df-messenger {
  z-index: 999;
  position: fixed;
  bottom: 16px;
  right: 16px;

  --df-messenger-primary-color: #1c6758;
  --df-messenger-font-color: #2b2b2b;
  --df-messenger-font-family: Google Sans;

  --df-messenger-chat-background: #effbf8;

  --df-messenger-message-user-background: #26e5bc;
  --df-messenger-message-user-font-color: #2b2b2b;
  --df-messenger-message-bot-background: #81f1d9;
  --df-messenger-message-bot-font-color: #2b2b2b;

  --df-messenger-titlebar-background: #1c6758;
  --df-messenger-titlebar-font-color: #ffffff;
  --df-messenger-titlebar-icon-font-color: #ffffff;

  --df-messenger-send-icon-color: #1c6758;
  --df-messenger-send-icon-color-active: #1c6758;
  --df-messenger-send-icon-color-hover: #17826d;

  --df-messenger-input-box-background: #ffffff;
  --df-messenger-input-box-focus-border: 2px solid #1c6758;
  --df-messenger-input-font-color: #2b2b2b;
  --df-messenger-input-placeholder-font-color: #555555;

  --df-messenger-chat-bubble-background: #26e5bc;
  --df-messenger-chat-bubble-icon-color: #1c6758;

  --df-messenger-message-feedback-icon-font-color-active: #1c6758;

  --df-messenger-chips-font-color: #2b2b2b;
  --df-messenger-chips-background: #d6f7ee;
  --df-messenger-chips-border-color: #26e5bc;
  --df-messenger-chips-icon-font-color: #1c6758;
}
</style>
