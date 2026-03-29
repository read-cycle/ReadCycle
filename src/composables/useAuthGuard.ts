import { onAuthStateChanged, type User } from 'firebase/auth';
import { onBeforeUnmount, ref } from 'vue';
import { auth } from '../firebase-init';
import router from '../router';

export function useAuthGuard() {
  const user = ref<User | null>(auth.currentUser);
  const authReady = ref(false);

  const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
    user.value = nextUser;
    authReady.value = true;

    if (!nextUser) {
      router.push('/login');
    }
  });

  onBeforeUnmount(() => {
    unsubscribe();
  });

  return {
    user,
    authReady
  };
}
