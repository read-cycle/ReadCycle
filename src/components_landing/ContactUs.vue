<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { createContactFormEmail } from '../emailTemplates'
import { sendEmail } from '@/sendEmail'

const toast = useToast()
const name = ref('')
const grade = ref('')
const email = ref('')
const message = ref('')
const loading = ref(false)

async function handleSubmit() {
  if (loading.value) return

  loading.value = true

  const subject = `ReadCycle Contact Form – ${name.value} (${grade.value})`

  try {
    await sendEmail(
      'readcycle@inventureacademy.com',
      subject,
      createContactFormEmail({
        name: name.value,
        grade: grade.value,
        email: email.value,
        message: message.value
      })
    )

    toast.success('Message sent successfully.')
    resetForm()
  } catch (err) {
    console.error(err)
    toast.error('Failed to send message. Please try again.')
  } finally {
    loading.value = false
  }
}

function resetForm() {
  name.value = ''
  grade.value = ''
  email.value = ''
  message.value = ''
}
</script>

<template>
  <section class="contact-us-section" id="contact-us" aria-labelledby="contact-us-heading">
    <div class="section-inner">
      <div class="contact-copy">
        <p class="section-kicker">Contact Us</p>
        <h2 id="contact-us-heading">Let’s Keep the Story Going</h2>
        <p class="section-subheading">
          Questions, suggestions, bugs, or ideas for new features all belong here.
        </p>

        <div class="contact-note">
          <p class="note-label">Best for</p>
          <p class="note-copy">
            Feedback on the exchange flow, feature requests, or anything that could make ReadCycle more useful for students.
          </p>
        </div>

        <div class="email-chip">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/>
            <rect x="2" y="4" width="20" height="16" rx="2"/>
          </svg>
          <span>readcycle@inventureacademy.com</span>
        </div>

        <div class="illustration-panel" aria-hidden="true">
          <div class="illustration-plane"></div>
        </div>
      </div>

      <div class="form-shell">
        <form class="contact-form" @submit.prevent="handleSubmit">
          <div class="form-grid">
            <label>
              <span>Name</span>
              <input v-model="name" type="text" name="name" required placeholder="e.g. Nikhil Singh">
            </label>

            <label>
              <span>Grade / Class</span>
              <input v-model="grade" type="text" name="grade" required placeholder="e.g. Grade 11">
            </label>

            <label>
              <span>Email</span>
              <input v-model="email" type="email" name="email" required placeholder="e.g. you@example.com">
            </label>

            <label class="message-field">
              <span>Message</span>
              <textarea
                v-model="message"
                name="message"
                rows="6"
                required
                placeholder="What would you like to tell us?"
              ></textarea>
            </label>
          </div>

          <button type="submit" class="submit-button" :disabled="loading">
            {{ loading ? 'Sending...' : 'Send Message' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.contact-us-section {
  --section-max-width: 84rem;
  --section-padding-inline: clamp(1rem, 4vw, 2.5rem);
  --section-padding-block: clamp(4rem, 9vw, 6.5rem);
  --accent-color: #1c6758;
  --muted-text: #536861;
  --surface-color: rgba(255, 255, 255, 0.9);
  --surface-outline: rgba(28, 103, 88, 0.12);

  width: 100%;
  padding: var(--section-padding-block) var(--section-padding-inline);
  background:
    radial-gradient(circle at 82% 12%, rgba(38, 229, 188, 0.16), transparent 26%),
    linear-gradient(180deg, rgba(129, 241, 217, 0.08), rgba(255, 255, 255, 0));
}

.section-inner {
  width: 100%;
  max-width: var(--section-max-width);
  margin: 0 auto;
  display: grid;
  gap: 2rem;
}

.contact-copy,
.contact-note,
.email-chip,
.form-shell {
  border-radius: 1.75rem;
}

.contact-copy {
  display: grid;
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

.section-subheading,
.note-label,
.note-copy,
.email-chip,
.contact-form label,
.contact-form input,
.contact-form textarea,
.submit-button {
  font-family: 'Nunito';
}

.section-subheading {
  margin: 0;
  max-width: 36rem;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--muted-text);
}

.contact-note {
  padding: 1.15rem 1.25rem;
  border: 1px solid var(--surface-outline);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 18px 40px rgba(28, 103, 88, 0.08);
}

.note-label {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent-color);
}

.note-copy {
  margin: 0.45rem 0 0;
  font-size: 0.98rem;
  line-height: 1.7;
  color: var(--muted-text);
}

.email-chip {
  width: fit-content;
  max-width: 100%;
  min-height: 44px;
  padding: 0.85rem 1rem;
  border: 1px solid var(--surface-outline);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 14px 28px rgba(28, 103, 88, 0.08);
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  color: var(--accent-color);
  font-size: 0.98rem;
  font-weight: 800;
  overflow-wrap: anywhere;

  svg {
    width: 1.1rem;
    height: 1.1rem;
    flex: 0 0 auto;
  }
}

.illustration-panel {
  min-height: 16rem;
  border-radius: 2rem;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.26), transparent 32%),
    linear-gradient(135deg, rgba(23, 130, 109, 0.94), rgba(38, 229, 188, 0.78));
  position: relative;
  overflow: hidden;
  box-shadow: 0 24px 44px rgba(28, 103, 88, 0.16);
}

.illustration-plane {
  position: absolute;
  inset: auto -10% -8% auto;
  width: min(28rem, 100%);
  height: 100%;
  background-image: url(@/assets/images/planepelt.svg);
  background-size: contain;
  background-repeat: no-repeat;
  background-position: right bottom;
}

.form-shell {
  padding: 1.1rem;
  border: 1px solid var(--surface-outline);
  background: var(--surface-color);
  box-shadow: 0 18px 40px rgba(28, 103, 88, 0.08);
}

.contact-form {
  display: grid;
  gap: 1rem;
}

.form-grid {
  display: grid;
  gap: 1rem;
}

.contact-form label {
  display: grid;
  gap: 0.45rem;
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--accent-color);
}

.contact-form input,
.contact-form textarea {
  width: 100%;
  min-height: 3rem;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(28, 103, 88, 0.14);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.95);
  font-size: 0.98rem;
  color: #2b2b2b;
  outline: none;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease;

  &:focus {
    border-color: rgba(28, 103, 88, 0.35);
    box-shadow: 0 0 0 4px rgba(38, 229, 188, 0.12);
  }
}

.contact-form textarea {
  min-height: 10rem;
  resize: vertical;
}

.submit-button {
  min-height: 48px;
  padding: 0.95rem 1.35rem;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(38, 229, 188, 0.95), rgba(129, 241, 217, 0.95));
  color: var(--accent-color);
  font-size: 1rem;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 14px 28px rgba(28, 103, 88, 0.14);
}

.submit-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

@media (min-width: 900px) {
  .section-inner {
    grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
    align-items: start;
  }

  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .message-field {
    grid-column: 1 / -1;
  }
}
</style>
