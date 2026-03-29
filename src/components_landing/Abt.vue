<template>
  <section class="about-us-section" id="about-us" aria-labelledby="about-us-heading">
    <div class="section-inner">
      <div class="copy-panel">
        <p class="section-kicker">About Us</p>
        <h2 id="about-us-heading">Give Books a Second Life</h2>
        <p class="section-subheading">
          A student-run exchange that keeps useful books moving through the school community.
        </p>

        <div class="story-card">
          <p>
            <strong>ReadCycle</strong> helps students pass on books that are still useful instead of letting
            them sit on a shelf. If you have textbooks, novels, or revision guides you no longer need,
            someone else can pick up exactly where you left off.
          </p>
          <p>
            The goal is simple: make sharing easier, reduce waste, and help more students get access to
            the books they need without turning the process into a hassle.
          </p>
        </div>

        <div class="highlights">
          <article class="highlight-card">
            <span class="highlight-label">School-first</span>
            <p>Built around students helping students, not reselling.</p>
          </article>
          <article class="highlight-card">
            <span class="highlight-label">Simple to use</span>
            <p>List a book, request one, then arrange the exchange in chat.</p>
          </article>
          <article class="highlight-card">
            <span class="highlight-label">Better reuse</span>
            <p>Every reused book saves money, materials, and time for the next reader.</p>
          </article>
        </div>
      </div>

      <div class="visual-panel">
        <div class="visual-surface">
          <div class="scene"></div>
          <div class="me">
            <div class="me-label">
              Nikhil Singh<br>
              Grade 11
            </div>
          </div>
        </div>

        <div class="quote-card">
          <p class="quote-label">Why it exists</p>
          <p class="quote-copy">
            Books already have value. ReadCycle just helps them reach the next person faster.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.about-us-section {
  --section-max-width: 84rem;
  --section-padding-inline: clamp(1rem, 4vw, 2.5rem);
  --section-padding-block: clamp(4rem, 9vw, 6.5rem);
  --accent-color: #1c6758;
  --muted-text: #536861;
  --surface-color: rgba(255, 255, 255, 0.88);
  --surface-outline: rgba(28, 103, 88, 0.12);
  --highlight-bg: rgba(38, 229, 188, 0.08);

  width: 100%;
  padding: var(--section-padding-block) var(--section-padding-inline);
  background:
    radial-gradient(circle at 15% 18%, rgba(38, 229, 188, 0.16), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(129, 241, 217, 0.12));
}

.section-inner {
  width: 100%;
  max-width: var(--section-max-width);
  margin: 0 auto;
  display: grid;
  gap: 2rem;
}

.copy-panel {
  display: grid;
  gap: 1.25rem;

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
.story-card p,
.highlight-card p,
.quote-copy,
.quote-label,
.me-label {
  font-family: 'Nunito';
}

.section-subheading {
  margin: 0;
  max-width: 36rem;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--muted-text);
}

.story-card,
.highlight-card,
.quote-card {
  border-radius: 1.75rem;
  border: 1px solid var(--surface-outline);
  background: var(--surface-color);
  box-shadow: 0 18px 40px rgba(28, 103, 88, 0.08);
}

.story-card {
  padding: 1.4rem;
  display: grid;
  gap: 1rem;

  p {
    margin: 0;
    font-size: 1rem;
    line-height: 1.75;
    color: var(--muted-text);
  }
}

.highlights {
  display: grid;
  gap: 1rem;
}

.highlight-card {
  padding: 1.15rem 1.2rem;
  background: linear-gradient(135deg, var(--highlight-bg), rgba(255, 255, 255, 0.92));

  p {
    margin: 0.6rem 0 0;
    font-size: 0.98rem;
    line-height: 1.6;
    color: var(--muted-text);
  }
}

.highlight-label,
.quote-label {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-family: 'Manrope';
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--accent-color);
}

.visual-panel {
  display: grid;
  gap: 1rem;
}

.visual-surface {
  position: relative;
  min-height: 28rem;
  border-radius: 2rem;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.24), transparent 30%),
    linear-gradient(135deg, rgba(23, 130, 109, 0.94), rgba(38, 229, 188, 0.78));
  box-shadow: 0 24px 44px rgba(28, 103, 88, 0.16);
}

.scene {
  position: absolute;
  inset: 0;
  background-image: url(@/assets/images/scene.svg);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  opacity: 0.95;
}

.me {
  position: absolute;
  bottom: 0;
  left: 52%;
  transform: translateX(-50%);
  width: min(18rem, 42vw);
  aspect-ratio: 325 / 462;
  background-image: url(@/assets/images/me.svg);
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center bottom;
}

.me-label {
  position: absolute;
  top: 1.2rem;
  left: 1.2rem;
  padding: 0.75rem 0.9rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.86);
  font-size: 0.9rem;
  font-weight: 800;
  line-height: 1.4;
  color: var(--accent-color);
  box-shadow: 0 16px 30px rgba(28, 103, 88, 0.14);
}

.quote-card {
  padding: 1.2rem 1.3rem;
}

.quote-copy {
  margin: 0.35rem 0 0;
  font-size: 0.98rem;
  line-height: 1.7;
  color: var(--muted-text);
}

@media (min-width: 900px) {
  .section-inner {
    grid-template-columns: minmax(0, 1fr) minmax(18rem, 33rem);
    align-items: center;
  }

  .copy-panel {
    padding-right: 1rem;
  }

  .highlights {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
