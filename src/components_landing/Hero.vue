<script setup lang="ts">
import { onMounted } from 'vue';
import { manropeGlyphData } from '../mappings';
import peep1 from '@/assets/images/peep-1.svg';
import peep2 from '@/assets/images/peep-2.svg';
import peep3 from '@/assets/images/peep-3.svg';
import peep4 from '@/assets/images/peep-4.svg';

function getGlyphBox(el: HTMLElement, letterIndex: number) {
  const textNodes = Array.from(el.childNodes).filter((node): node is ChildNode => node.nodeType === Node.TEXT_NODE);
  let total = 0;
  for (const node of textNodes) {
    const len = node.textContent?.length ?? 0;
    if (letterIndex < total + len) {
      const range = document.createRange();
      range.setStart(node, letterIndex - total);
      range.setEnd(node, letterIndex - total + 1);
      return range.getBoundingClientRect();
    }
    total += len;
  }
  return null;
}

function getManropeOGlyphMetrics(
  char: string,
  fontSizePx: number,
  lineIndex: number = 0,
  lineHeight: number = 1.2
) {
  const scaleWidth = (basePx: number) => (basePx / 1920) * window.innerWidth;
  const unitsPerEm = 2000;
  const glyph = manropeGlyphData[char as keyof typeof manropeGlyphData];

  const width = (glyph.widthUnits / unitsPerEm) * fontSizePx;
  const height = (glyph.heightUnits / unitsPerEm) * fontSizePx;
  const topOffset = (glyph.topOffsetUnits / unitsPerEm) * fontSizePx;

  const lineOffset = fontSizePx/7 * lineHeight * lineIndex;

  return {
    width,
    height,
    top: lineOffset + topOffset + scaleWidth(10)
  };
}

const glyphIndices = [2, 3, 5, 7]

function renderPeeps() {
    const highlightedText = document.querySelector('.hero-highlighted');
    if (!(highlightedText instanceof HTMLElement)) return;
    const content = highlightedText.textContent ?? '';
    const peepBoxes: HTMLDivElement[] = [];
    for(let i = 0; i < glyphIndices.length; i++) {
        const glyphIndex = glyphIndices[i];
        const char = content[glyphIndex];
        const glyphRect = getGlyphBox(highlightedText, glyphIndex);
        const parentRect = highlightedText.getBoundingClientRect();

        if (glyphRect) {
          const box = document.createElement('div');

          peepBoxes.push(box);

          box.classList.add('peep-box');

          const fontSize = parseFloat(getComputedStyle(highlightedText).fontSize);
          const { width, height, top } = getManropeOGlyphMetrics(char, fontSize, 1);

          box.style.position = "absolute";
          box.style.left = `${glyphRect.left - parentRect.left}px`;
          box.style.top = `${top}px`;
          box.style.width = `${width}px`;
          box.style.height = `${height}px`;

          highlightedText.appendChild(box);
        }
    }

    const scaleWidth = (basePx: number) => (basePx / 1920) * window.innerWidth;

    const redBox = document.createElement("div");
    redBox.className = 'peep peep-1-box';
    redBox.style.background = `url('${peep1}')`;
    redBox.style.backgroundRepeat = "no-repeat";
    redBox.style.backgroundSize = "contain";
    redBox.style.backgroundPosition = "center center";
    redBox.style.position = "absolute";
    redBox.style.top = `${scaleWidth(3)}px`;
    redBox.style.left = "50%";
    redBox.style.transform = "translate(-50%)";
    redBox.style.width = `${scaleWidth(130)}px`;
    redBox.style.aspectRatio = "82 / 111";
    peepBoxes[3]?.appendChild(redBox);

    const redBox2 = document.createElement("div");
    redBox2.className = 'peep peep-2-box';
    redBox2.style.background = `url('${peep2}')`;
    redBox2.style.backgroundRepeat = "no-repeat";
    redBox2.style.backgroundSize = "contain";
    redBox2.style.backgroundPosition = "center center";
    redBox2.style.position = "absolute";
    redBox2.style.left = `${scaleWidth(97.5)}px`;
    redBox2.style.top = `${scaleWidth(0)}px`;
    redBox2.style.width = `${scaleWidth(130)}px`;
    redBox2.style.aspectRatio = "360 / 498";
    peepBoxes[1]?.appendChild(redBox2);

    const redBox3 = document.createElement("div");
    redBox3.className = 'peep peep-3-box';
    redBox3.style.background = `url('${peep3}')`;
    redBox3.style.backgroundRepeat = "no-repeat";
    redBox3.style.backgroundSize = "contain";
    redBox3.style.backgroundPosition = "center center";
    redBox3.style.position = "absolute";
    redBox3.style.left = `${scaleWidth(70)}px`;
    redBox3.style.width = `${scaleWidth(130)}px`;
    redBox3.style.transform = "translateX(-50%) rotate(2.5deg)";
    redBox3.style.top = `${scaleWidth(-60)}px`;
    redBox3.style.aspectRatio = "495 / 337";
    peepBoxes[2]?.appendChild(redBox3);

    const redBox4 = document.createElement("div");
    redBox4.className = 'peep peep-4-box';
    redBox4.style.background = `url('${peep4}')`;
    redBox4.style.backgroundRepeat = "no-repeat";
    redBox4.style.backgroundSize = "contain";
    redBox4.style.backgroundPosition = "center center";
    redBox4.style.position = "absolute";
    redBox4.style.left = `${scaleWidth(65)}px`;
    redBox4.style.top = `${scaleWidth(-45)}px`;
    redBox4.style.width = `${scaleWidth(130)}px`;
    redBox4.style.transform = "translateX(-50%)";
    redBox4.style.aspectRatio = "468 / 300";
    peepBoxes[0]?.appendChild(redBox4);
}

onMounted(async () => {
    await document.fonts.ready;
    renderPeeps();
    window.addEventListener("resize", () => {
        document.querySelectorAll(".peep").forEach(nd => {
            nd.remove();
        })
        renderPeeps()
    })
})
</script>
<template>
    <div class="hero-container">
        <h1 class="hero-header">
          <span class="lead-in">Pass Books Forward</span><br>
          <span class="hero-highlighted">Read<br class="mobile-break"> Cycle</span>
        </h1>
        <div class="cta-btn-container">
            <router-link to="/login" class="login-btn"><button class="cta-btn">Start Sharing</button></router-link>
            <a href="#how-it-works" class="cta-btn secondary">See How It Works</a>
        </div>
        <p class="hero-purpose">
            ReadCycle helps students list the books they’re done with and connect with peers who need them.
        </p>
        <div class="subtext-container">
            <h3 class="hero-subtext">for <span class="subtext-highlighted">students</span>. by <span class="subtext-highlighted">students</span>.</h3>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.hero-container {
    position: relative;
    width: 100%;
    height: 100dvh;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(20, 1fr);
    text-align: center;
    background:
      radial-gradient(circle at 15% 18%, rgba(38, 229, 188, 0.25), transparent 30%),
      radial-gradient(circle at 80% 25%, rgba(23, 130, 109, 0.16), transparent 30%),
      linear-gradient(180deg, rgba(129, 241, 217, 0.08), rgba(255, 255, 255, 0));

    .hero-header {
        grid-row: 5 / 15;
        font-family: 'Manrope';
        text-align: center;
        line-height: 1.2;
        z-index: 5;
        color: $color-text;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        overflow: visible !important;
        .lead-in {
            font-size: px-to-vw(80);
        }
        .hero-highlighted {
            display: block;
            position: relative;
            font-size: clamp(2rem, 12vw, 30vh);            
            background: linear-gradient(to right, $color-primary, $color-accent);
            background-clip: text;
            word-spacing: 50px;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    }
        .cta-btn-container {
            display: flex;
            align-items: center;
            justify-content: center;
            grid-row: 15/16;
            .cta-btn {
            font-family: 'Nunito';
            text-decoration: none;
            svg {
                font-size: px-to-vw(40);
            }
            color: $color-text;
            border-radius: 14px;
            background: linear-gradient(to right, $color-secondary, $color-secondary-lightened);
            padding: 1rem 2rem;
            cursor: pointer;
            border: 4px solid $color-background;
            transition: box-shadow 0.4s ease;
            &:hover {
                box-shadow: 0 0 0 4px $color-primary;
            }
            display: flex;
            align-items: center;
            justify-content: center;
            column-gap: 10px;
            position: relative;
            z-index: 4;
        }
            .secondary {
                margin-left: 1rem;
                border: 4px solid rgba(28, 103, 88, 0.35);
                background: rgba(255, 255, 255, 0.92);
                color: $color-accent;
            }
        }
        .login-btn {
            text-decoration: none;
        }
        .hero-purpose {
            margin: 0.75rem 1.6rem 0;
            font-family: 'Nunito';
            font-size: 1rem;
            color: $color-text;
            max-width: 54rem;
            justify-self: center;
        }

        .subtext-container {
        grid-row: 18/19;
        display: flex;
        align-items: center;
        justify-content: center;
        .hero-subtext {
            font-family: 'Matangi';
            font-weight: 350;
            letter-spacing: 3px;
            color: $color-text;
        }
        .subtext-highlighted {
            color: $color-primary;
            font-weight: 500;
        }
    }
}
@media screen and (min-width: 1025px) {
    .cta-btn {
        font-size: px-to-vw(20);
    }
    .hero-subtext {
        font-size: px-to-vw(30);
    }
}
@media screen and (max-width: 1025px) {
    .cta-btn {
        font-size: px-to-vw(50);
    }
    .hero-subtext {
        font-size: px-to-vw(60);
    }
}
@media screen and (max-width: 950px) {
    .cta-btn {
        font-size: px-to-vw(50);
    }
    .hero-subtext {
        font-size: px-to-vw(55);
    }
}
@media screen and (max-width: 550px) {
    .cta-btn {
        font-size: px-to-vw(60);
    }
    .hero-subtext {
        font-size: px-to-vw(50);
    }
}
@media screen and (min-width: 750px) {
    .hero-highlighted {
        word-spacing: 50px;
    }
    .mobile-break {
        display: none;
    }
}
@media screen and (max-width: 750px) {
    :deep(.peep-box) {
        display: none !important;
    }
    .mobile-break {
        display: block;
    }

}
</style>
