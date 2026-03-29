import { computed, inject, onBeforeUnmount, provide, reactive, ref, type InjectionKey } from 'vue';
import {
  GoogleAuthProvider,
  OAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import browse from '../assets/images/browse2.svg';
import exchange from '../assets/images/exchange.svg';
import scan from '../assets/images/scan.svg';
import texting from '../assets/images/texting.svg';
import { auth } from '../firebase-init';
import router from '../router';

type LoginCarouselItem = [string, string, boolean];

function humanizeFirebaseError(error: unknown, context: 'login' | 'signup' | 'reset' | 'oauth' = 'login') {
  const code = (error as { code?: string } | null | undefined)?.code;

  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already in use. Please log in instead of signing up.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.';
    case 'auth/credential-already-in-use':
      return 'This account is already linked to another user.';
    case 'auth/user-not-found':
      return 'No account found with this email, please sign up.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return "Invalid email or password. If you don't have an account, please sign up. If you signed up using Google or another provider, please use that option.";
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/invalid-email':
      return 'The email address is invalid.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing.';
    case 'auth/cancelled-popup-request':
      return 'Another sign-in popup is already open.';
    case 'auth/popup-blocked':
      return 'Popup blocked by your browser. Please allow popups.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    default:
      if (context === 'signup') return 'Failed to create account. Please try again.';
      if (context === 'reset') return 'Failed to send password reset email.';
      return 'Authentication failed. Please try again.';
  }
}

function createLoginPageStore() {
  const authLoading = ref(false);
  const email = ref('');
  const password = ref('');
  const name = ref('');
  const confirmPassword = ref('');
  const rememberMe = ref(true);
  const newUser = ref(false);
  const imageData = reactive<LoginCarouselItem[]>([
    [scan, "Scan your book — we'll fetch the details.", true],
    [browse, 'Browse books from nearby families.', false],
    [texting, 'Message parents to coordinate exchange.', false],
    [exchange, 'Exchange books in person or drop-off.', false]
  ]);

  let counter = 0;
  const intervalId = window.setInterval(() => {
    imageData.forEach((item, index) => {
      item[2] = index === counter;
    });

    counter = (counter + 1) % imageData.length;
  }, 5000);

  onBeforeUnmount(() => {
    window.clearInterval(intervalId);
  });

  const activeItem = computed(() => imageData.find((item) => item[2]));

  function validateEmail(emailValue: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  }

  function getPersistenceType() {
    return rememberMe.value ? browserLocalPersistence : browserSessionPersistence;
  }

  async function loginEmailPassword() {
    const emailValue = email.value.trim();
    const passwordValue = password.value;

    if (!emailValue) return window.alert('Email cannot be blank.');
    if (!validateEmail(emailValue)) return window.alert('Please enter a valid email address.');
    if (!passwordValue) return window.alert('Password cannot be blank.');

    authLoading.value = true;

    setPersistence(auth, getPersistenceType())
      .then(() => signInWithEmailAndPassword(auth, emailValue, passwordValue))
      .then((userCredential) => {
        if (!userCredential.user.emailVerified) {
          window.alert('Please verify your email before logging in.');
          return;
        }

        router.push('/dashboard');
      })
      .catch(async (error) => {
        console.error('Login error:', error);
        window.alert(humanizeFirebaseError(error, 'login'));
      })
      .finally(() => {
        authLoading.value = false;
      });
  }

  function signUpEmailPassword() {
    const nameValue = name.value.trim();
    const emailValue = email.value.trim();
    const passwordValue = password.value;
    const passwordVerifyValue = confirmPassword.value;

    if (!nameValue) return window.alert('Name cannot be blank.');
    if (!emailValue) return window.alert('Email cannot be blank.');
    if (!validateEmail(emailValue)) return window.alert('Please enter a valid email address.');
    if (!passwordValue) return window.alert('Password cannot be blank.');
    if (passwordValue.length < 6) return window.alert('Password must be at least 6 characters long.');
    if (passwordValue !== passwordVerifyValue) return window.alert('Passwords do not match.');

    authLoading.value = true;
    setPersistence(auth, getPersistenceType())
      .then(() => createUserWithEmailAndPassword(auth, emailValue, passwordValue))
      .then(async (userCredential) => {
        await updateProfile(userCredential.user, { displayName: nameValue });
        await sendEmailVerification(userCredential.user);
        window.alert('Account created! Please check your email to verify your account before logging in.');
      })
      .catch((error) => {
        console.error('Sign-up error:', error);
        window.alert(humanizeFirebaseError(error, 'signup'));
      })
      .finally(() => {
        authLoading.value = false;
      });
  }

  function signInWithProvider(provider: GoogleAuthProvider | OAuthProvider | FacebookAuthProvider | TwitterAuthProvider) {
    signInWithPopup(auth, provider)
      .then(() => {
        router.push('/dashboard');
      })
      .catch((error) => {
        console.error(error);
        window.alert(humanizeFirebaseError(error, 'oauth'));
      });
  }

  function signInGoogle() {
    signInWithProvider(new GoogleAuthProvider());
  }

  function signInMicrosoft() {
    signInWithProvider(new OAuthProvider('microsoft.com'));
  }

  function signInMeta() {
    signInWithProvider(new FacebookAuthProvider());
  }

  function signInTwitter() {
    signInWithProvider(new TwitterAuthProvider());
  }

  async function resetPassword() {
    try {
      const emailValue = email.value.trim();

      if (!emailValue) {
        window.alert('Email cannot be blank.');
        return;
      }

      if (!validateEmail(emailValue)) {
        window.alert('Please enter a valid email address.');
        return;
      }

      await sendPasswordResetEmail(auth, emailValue);
      window.alert('Password reset email sent!');
    } catch (error) {
      console.error(error);
      window.alert(humanizeFirebaseError(error, 'reset'));
    }
  }

  function submitAuthForm() {
    if (newUser.value) {
      signUpEmailPassword();
      return;
    }

    loginEmailPassword();
  }

  return {
    activeItem,
    authLoading,
    imageData,
    email,
    password,
    name,
    confirmPassword,
    rememberMe,
    newUser,
    submitAuthForm,
    loginEmailPassword,
    signUpEmailPassword,
    signInGoogle,
    signInMicrosoft,
    signInMeta,
    signInTwitter,
    resetPassword
  };
}

type LoginPageStore = ReturnType<typeof createLoginPageStore>;

const loginPageStoreKey: InjectionKey<LoginPageStore> = Symbol('login-page-store');

export function provideLoginPage() {
  const store = createLoginPageStore();
  provide(loginPageStoreKey, store);
  return store;
}

export function useLoginPage() {
  const store = inject(loginPageStoreKey);

  if (!store) {
    throw new Error('useLoginPage must be used within LoginPage.');
  }

  return store;
}
