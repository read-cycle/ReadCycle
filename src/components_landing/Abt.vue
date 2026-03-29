<template>
<div class="about-us-container" id="about-us">
    <div class="image-half">
        <div class="scene"></div>
        <div class="me">
            <div class="me-label">
              Nikhil Singh<br>
              Grade 11
            </div>
        </div>
    </div>
    <div class="text-half">
        <h2 class="text-half-heading">Give Books a <span class="sl-imp">Second Life</span></h2>
        <p class="text-half-subheading">
            A simple, <strong>student-run</strong> way to pass on your old textbooks.
        </p>
        <p class="text-half-para">
            <strong>ReadCycle</strong> is a student-led project that helps you pass on your old textbooks to someone who actually needs them. Instead of letting books pile up unused, you can use this site to share them with juniors who are just starting out. It’s <strong>simple</strong>, <strong>sustainable</strong>, and <strong>school-first</strong> — no money involved, just <strong>students helping students</strong>.  
            <br><br>
            Whether you're clearing out shelves or looking for the books you need, ReadCycle makes the process <strong>quick</strong> and <strong>hassle-free</strong>. Every textbook reused means <strong>one less going to waste</strong> — and <strong>one more student getting a smoother start</strong>.
        </p>
    </div>
</div>
</template>
<style lang="scss" scoped>
.about-us-container {
    width: 100%;
    height: 100dvh;
    background-color: $color-background;
    display: flex;
    position: relative;
}
.image-half {
    background-color: $color-accent-lightened;
    position: relative;
}
.text-half {
    display: flex;
    justify-content: center;
    flex-direction: column;
    padding: 1vw;
    row-gap: 10px;
}
@media screen and (min-width: 1025px) {
    .text-half {
        width: 50%;
        height: 100%;
        text-align: right;
        align-items: flex-end;
        padding: 4vw;
    }
    .image-half {
        width: 50%;
        height: 100%;
    }
}
@media screen and (max-width: 1025px) {
    .text-half {
        position: relative;
        z-index: 5;
        width: 100%;
        height: 100%;
        text-align: center;
        align-items: center;
        padding: 1vw;
    }
    .image-half {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 4;
        left: 0;
        top: 0;
        opacity: 0.25;
        .me-label {
            display: none;
        }
    }
}
.text-half-heading {
    font-family: 'Manrope';
    color: $color-accent;
    .sl-imp {
        text-decoration: underline 3px $color-accent-lightened;
        font-weight: 800;
    }
}
.text-half-subheading, .text-half-para {
    font-family: 'Nunito';
}
.scene {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url(@/assets/images/scene.svg);
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
}
.me {
    position: absolute;
    bottom: 0;
    left: 55%;
    transform: translateX(-50%);
    height: 50%;
    aspect-ratio: 325/462;
    background-image: url(@/assets/images/me.svg);
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
}
.me-label {
    position: absolute;
    top: -5%;
    left: 0;
    width: 100%;
    height: 5%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    font-family: 'Nunito';
    color: white;
}
@media screen and (min-width: 1025px) {
    .text-half-heading {
        font-size: px-to-vw(60);
    }
    .text-half-para {
        font-size: px-to-vw(16);
    }
    .text-half-subheading {
        font-size: px-to-vw(25);
    }
}
@media screen and (max-width: 1025px) {
    .text-half-heading {
        font-size: px-to-vw(120);
    }
    .text-half-para {
        font-size: px-to-vw(45);
    }
    .text-half-subheading {
        font-size: px-to-vw(60);
    }
}
@media screen and (max-width: 950px) {
    .text-half-heading {
        font-size: px-to-vw(120);
    }
    .text-half-para {
        font-size: px-to-vw(45);
    }
    .text-half-subheading {
        font-size: px-to-vw(60);
    }
}
@media screen and (max-width: 550px) {
    .text-half-heading {
        font-size: px-to-vw(120);
    }
    .text-half-para {
        font-size: px-to-vw(45);
    }
    .text-half-subheading {
        font-size: px-to-vw(60);
    }
}
</style>