<template>
<div class="navbar">
    <ul class="navbar-ul">
        <li class="navbar-item header-item"><a href="" class="navbar-link"><div class="logo-icon"><img src="../assets/icons/rc_logo.svg" alt="Logo" /></div>ReadCycle</a></li>
        <li class="navbar-item"><a href="#" class="navbar-link">Home</a></li>
        <li class="navbar-item"><a href="#about-us" class="navbar-link">About Us</a></li>
        <li class="navbar-item"><a href="#how-it-works" class="navbar-link">How it Works</a></li>
        <li class="navbar-item"><a href="#contact-us" class="navbar-link">Contact Us</a></li>
        <li class="navbar-item login-item"><a href="" class="navbar-link"></a>
            <router-link to="/login" class="login-btn">Login</router-link>
        </li>
    </ul>
</div>
</template>
<style lang="scss" scoped>
.navbar {
    background-color: $color-background;
    position: fixed;
    z-index: 10;
    top: 0;
    left: 0;
    width: 100%;
    height: 10dvh;
    .navbar-ul {
        width: 100%;
        height: 100%;
        list-style-type: none;
        display: flex;
        align-items: center;
        justify-content: center;
        .header-item {
            margin-right: auto;
            font-family: 'Nunito';
        }
        .login-item {
            margin-left: auto;
            .login-btn {
                padding: 0.75vw 2vw;
                background-color: $color-primary;
                border: 2px solid $color-background;
                border-radius: 10px;
                transition: box-shadow 0.4s ease;
                text-decoration: none;
                color: $color-text;
                font-family: 'Nunito';
                &:hover {
                    box-shadow: 0 0 0 2px $color-primary;
                }
                cursor: pointer;
            }
        }
        .navbar-item {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            .navbar-link {
                text-decoration: none;
                color: $color-text;
                font-family: 'Nunito';
                display: flex;
                align-items: center;
                justify-content: center;
                column-gap: 4px;
                text-wrap: nowrap;
                .logo-icon {
                    aspect-ratio: 1/1;
                    padding-top: 4.5px;
                }
            }
        }
    }
}
@media screen and (min-width: 1200px) {
    .navbar-link {
        font-size: px-to-vw(25);
    }
    .login-btn {
        font-size: px-to-vw(25);
    }
    .logo-icon {
        img {
            width: 2vw;
        }
    }
}
@media screen and (max-width: 1200px) {
    .navbar-link {
        font-size: px-to-vw(35);
    }
    .login-btn {
        font-size: px-to-vw(35);
    }
    .logo-icon {
        img {
            width: 2vw;
        }
    }
    .logo-icon {
        img {
            width: 3vw;
        }
    }
}
@media screen and (max-width: 1025px) {
    .navbar-link {
        font-size: px-to-vw(45);
    }
    .login-btn {
        font-size: px-to-vw(45);
    }
    .logo-icon {
        img {
            width: 2vw;
        }
    }
    .logo-icon {
        img {
            width: 3vw;
        }
    }
}
@media screen and (max-width: 950px) {
    .navbar-link {
        font-size: px-to-vw(45);
    }
    .login-btn {
        font-size: px-to-vw(45);
    }
    .logo-icon {
        img {
            width: 5vw;
        }
    }
}
@media screen and (max-width: 550px) {
    .navbar-link {
        font-size: px-to-vw(40);
    }
    .login-btn {
        font-size: px-to-vw(40);
    }
    .logo-icon {
        img {
            width: 5vw;
        }
    }
}
</style>