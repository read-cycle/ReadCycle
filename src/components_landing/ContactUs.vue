<script setup lang="ts">
import { ref } from "vue";
import { sendEmail } from "@/sendEmail";

const name = ref("");
const grade = ref("");
const email = ref("");
const message = ref("");
const loading = ref(false);

async function handleSubmit() {
  if (loading.value) return;

  loading.value = true;

  const subject = `ReadCycle Contact Form – ${name.value} (${grade.value})`;

  const body = `
Name: ${name.value}
Grade/Class: ${grade.value}
Email: ${email.value}

Message:
${message.value}
  `.trim();

  try {
    await sendEmail(
      "readcycle@inventureacademy.com",
      subject,
      body
    );

    alert("Message sent successfully!");
    resetForm();
  } catch (err) {
    console.error(err);
    alert("Failed to send message. Please try again.");
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  name.value = "";
  grade.value = "";
  email.value = "";
  message.value = "";
}
</script>
<template>
<div class="contact-us-container" id="contact-us">
<div class="text-half">
  <h2 class="text-half-heading">Get in Touch</h2>
  <p class="text-half-subheading">
    Questions? Suggestions? I'm all ears.
  </p>
  <p class="text-half-para">
    Whether you're looking for a book, want to suggest a feature, or just feel like saying hi — drop a message below!
  </p>

  <form class="contact-form" @submit.prevent="handleSubmit">
    <div class="form-grid">
      <label>
        Name<br>
        <input type="text" name="name" required placeholder="e.g. Nikhil Singh" v-model="name">
      </label>
      
      <label>
        Grade/Class<br>
        <input type="text" name="grade" required placeholder="e.g. Grade 11" v-model="grade">
      </label>
      
      <label>
        Email<br>
        <input type="email" name="email" required placeholder="e.g. you@example.com" v-model="email">
      </label>
  
      <label>
        Message<br>
        <textarea name="message" rows="4" required placeholder="What's on your mind?" v-model="message"></textarea>
      </label>
    </div>
    <p class="mail-para"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail-icon lucide-mail"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg> readcycle@inventureacademy.com</p>
    <div class="form-button-row">
      <button type="submit" :disabled="loading">
        {{ loading ? "Sending..." : "Send Message" }}
      </button>
    </div>
  </form>
</div>
    <div class="image-half">
        <div class="image-half-img">

        </div>
    </div>
</div>
</template>
<style lang="scss" scoped>
.contact-us-container {
    position: relative;
    width: 100%;
    height: 100dvh;
    background-color: $color-background;
    display: flex;
}
.text-half {
    display: flex;
    justify-content: center;
    flex-direction: column;
    padding: 4vw;
    row-gap: 10px;
}
.text-half-heading {
    font-family: 'Manrope';
    color: $color-accent;
    .sl-imp {
        text-decoration: underline 3px $color-accent-lightened;
        font-weight: 800;
    }
}
.text-half-subheading, .text-half-para, .contact-form {
    font-family: 'Nunito';
}
.text-half-subheading, .text-half-para {
      text-align: center;
}
.contact-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  font-family: 'Nunito';
}
.form-grid label {
  display: flex;
  flex-direction: column;
  font-weight: 500;
}
.form-grid input {
    border-radius: 10px;
    padding: 0.5rem;
    border: 1px lightgray solid;
}
.form-grid textarea {
  resize: vertical;
  grid-column: span 2;
  font-family: 'Nunito';
  border-radius: 10px;
  padding: 0.5rem;
  border: 1px lightgray solid;
  resize: none;
}
.form-button-row {
  display: flex;
  justify-content: center;
}
.contact-form button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: linear-gradient(to right, $color-secondary, $color-secondary-lightened);
  border-radius: 0.5rem;
  cursor: pointer;
}
.image-half {
    background-color: $color-accent-lightened;
    .image-half-img {
        position: absolute;
        bottom: 0;
        left: -12%;
        width: 100%;
        aspect-ratio: 835/542;
        background-image: url(@/assets/images/planepelt.svg);
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center center;
    }
}
.mail-para {
    position: absolute;
    bottom: 3rem;
    left: 3rem;
    display: flex;
    column-gap: 10px;
    align-items: center;
    svg {
      width: px-to-vw(30);
    }
}
@media screen and (min-width: 1025px) {
  .text-half-heading {
    font-size: px-to-vw(60);
  }
  .text-half-subheading {
      font-size: px-to-vw(25);
  }
  .text-half-para {
    font-size: px-to-vw(16);
  }
  .text-half {
    width: 50%;
    height: 100%;
    align-items: flex-start;
  }
  .image-half {
    position: relative;
    width: 50%;
    height: 100%;
  }
  .mail-para {
    font-size: px-to-vw(16);
  }
  .form-grid label {
    font-size: px-to-vw(10);
  }
  .form-grid input, .form-grid textarea {
    font-size: px-to-vw(15);
  }
  .contact-form button {
    font-size: px-to-vw(15);
  }
}
@media screen and (max-width: 1025px) {
  .text-half {
    position: relative;
    z-index: 4;
    width: 100%;
    height: 100%;
    align-items: center;
  }
  .image-half {
    position: absolute;
    z-index: 3;
    width: 75%;
    height: 100%;
    left: 25%;
    top: 0;
    opacity: 0.5;
  }
  .text-half-heading {
    font-size: px-to-vw(80);
  }
  .text-half-subheading {
      font-size: px-to-vw(45);
  }
  .text-half-para {
    font-size: px-to-vw(40);
  }
  .form-grid input, .form-grid textarea {
    font-size: px-to-vw(35);
  }
  .mail-para {
    font-size: px-to-vw(40);
    svg {
      width: px-to-vw(80);
    }
  }
  .contact-form button {
    font-size: px-to-vw(45);
  }
  .form-grid label {
    font-size: px-to-vw(45);
  }
}
@media screen and (max-width: 950px) {
  .text-half-heading {
    font-size: px-to-vw(80);
  }
  .text-half-subheading {
      font-size: px-to-vw(45);
  }
  .text-half-para {
    font-size: px-to-vw(40);
  }
  .form-grid input, .form-grid textarea {
    font-size: px-to-vw(35);
  }
  .mail-para {
    font-size: px-to-vw(35);
    svg {
      width: px-to-vw(80);
    }
  }
  .contact-form button {
    font-size: px-to-vw(30);
  }
  .form-grid label {
    font-size: px-to-vw(40);
  }
}
@media screen and (max-width: 550px) {
  .text-half-heading {
    font-size: px-to-vw(90);
  }
  .text-half-subheading {
      font-size: px-to-vw(45);
  }
  .text-half-para {
    font-size: px-to-vw(40);
  }
  .form-grid input, .form-grid textarea {
    font-size: px-to-vw(35);
  }
  .mail-para {
    font-size: px-to-vw(35);
    svg {
      width: px-to-vw(80);
    }
  }
  .contact-form button {
    font-size: px-to-vw(45);
  }
  .form-grid label {
    font-size: px-to-vw(40);
  }
}
.contact-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>