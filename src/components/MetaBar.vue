<script setup lang="ts">
import { computed, ref } from 'vue';
import { useToast } from 'vue-toastification';
import { query, collection, orderBy, getDocs, where } from 'firebase/firestore';
import { auth, db } from '../firebase-init';
import type { BuyerRequestedDoc } from '../interfaces';
import { normalizeMetadataValue } from '../interfaces';
import { updateProfile, onAuthStateChanged, updatePassword, linkWithPopup, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, OAuthProvider, deleteUser } from 'firebase/auth';
import router from '../router';
import type { FirestoreRecord } from '../composables/firestore';
import {Bell, BellDot, type LucideIcon} from 'lucide-vue-next';

let userID: string | null = null;
let userName: string | null = null;
let userEmail: string | null = null;
const toast = useToast();

const docsData = ref<FirestoreRecord<BuyerRequestedDoc>[]>([]);

function normalizeBuyerRequestedDoc(data: Record<string, unknown> & { id: string }): BuyerRequestedDoc {
  return {
    id: data.id,
    buyerName: typeof data.buyerName === 'string' ? data.buyerName : '',
    buyerQuantity: typeof data.buyerQuantity === 'number' ? data.buyerQuantity : 0,
    isbn: normalizeMetadataValue(data.isbn),
    title: normalizeMetadataValue(data.title),
    grade: normalizeMetadataValue(data.grade),
    subject: normalizeMetadataValue(data.subject),
    price: typeof data.price === 'number' ? data.price : 0,
    quantity: typeof data.quantity === 'number' ? data.quantity : 0,
    uploaderName: typeof data.uploaderName === 'string' ? data.uploaderName : '',
    listingImage: typeof data.listingImage === 'string' ? data.listingImage : '',
    extraImages: Array.isArray(data.extraImages) ? data.extraImages.filter((entry): entry is string => typeof entry === 'string') : [],
    timestamp: data.timestamp as BuyerRequestedDoc['timestamp'],
    uploaderEmail: typeof data.uploaderEmail === 'string' ? data.uploaderEmail : '',
    buyerEmail: typeof data.buyerEmail === 'string' ? data.buyerEmail : '',
    uploaderID: typeof data.uploaderID === 'string' ? data.uploaderID : '',
    buyerID: typeof data.buyerID === 'string' ? data.buyerID : '',
    listingDoc: data.listingDoc as BuyerRequestedDoc['listingDoc']
  };
}

function getErrorDetails(error: unknown) {
  return error as { code?: string; message?: string };
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User Exists")
    userID = user.uid;
    userEmail = user.email;
    userName = user.displayName;
    googleLinkedEmail.value = user.providerData.find(x => x.providerId == 'google.com')?.email;
    facebookLinkedEmail.value = user.providerData.find(x => x.providerId == 'facebook.com')?.email;
    twitterLinkedEmail.value = user.providerData.find(x => x.providerId == 'twitter.com')?.email;
    microsoftLinkedEmail.value = user.providerData.find(x => x.providerId == 'microsoft.com')?.email;

    const uploadDocs = query(
      collection(db, 'buyerRequested'),
      where('uploaderID', '==', userID),
      orderBy('timestamp', 'desc')
    );

    getDocs(uploadDocs).then((result) => {
      console.log(result)
      docsData.value = result.docs.map((doc) => {
        const data = normalizeBuyerRequestedDoc({ id: doc.id, ...doc.data() });
        console.log("Requested Docs:")
        console.log(data)
        return [doc.ref, data];
      });
    });

  } else {
    router.push('/login')
  }
})

defineProps({
    title: String
});

const googleLinkedEmail = ref<string | null>();
const facebookLinkedEmail = ref<string | null>();
const twitterLinkedEmail = ref<string | null>();
const microsoftLinkedEmail = ref<string | null>();

const showNotifs = ref(false);

const iconHtml: LucideIcon = computed(() => docsData.value.length >= 1 ? BellDot : Bell)

const toggleSettingsModal = ref(false);

const selectedSettingOption = ref('account');

const newPassword = ref('');

async function deleteAccount() {
  if (!auth.currentUser) return;

  const confirmed = window.confirm(`Are you sure you want to delete your account ${userEmail}? This action cannot be undone.`);

  if (!confirmed) return;

  try {
    await deleteUser(auth.currentUser);
    toast.success('Your account has been deleted.');
    router.push('/login');
  } catch (error: unknown) {
    const firebaseError = getErrorDetails(error);
    if (firebaseError.code === "auth/requires-recent-login") {
      toast.error('Please re-authenticate before deleting your account.');
      router.push('/login');
    } else {
      console.error(error);
      toast.error(`Error deleting account: ${firebaseError.message ?? 'Unknown error'}`);
    }
  }
}

async function resetPassword() {
  try {
    if (!userEmail) {
      return;
    }
    if(auth.currentUser) {
      await updatePassword(auth.currentUser, newPassword.value);
      toast.success('Password changed.');
    }
  } catch (error: unknown) {
    const firebaseError = getErrorDetails(error);
    if (firebaseError.code === "auth/requires-recent-login") {
      toast.error('Please re-authenticate before changing your password.');
      router.push('/login');
    } else {
      console.error(error);
      toast.error(`Error changing password: ${firebaseError.message ?? 'Unknown error'}`);
    }
  }
}

async function linkGoogleAccount() {
  if(!auth.currentUser) return
  const provider = new GoogleAuthProvider();
  try {
    const result = await linkWithPopup(auth.currentUser, provider);
    console.log("Linked provider:", result.user.providerData);
  } catch (error: unknown) {
    const firebaseError = getErrorDetails(error);
    if (firebaseError.code === "auth/credential-already-in-use") {
      toast.error('That Google account is already linked with another user.');
    } else {
      console.error(error);
      toast.error('Failed to link Google account.');
    }
  }
}

async function linkMetaAccount() {
  if(!auth.currentUser) return
  const provider = new FacebookAuthProvider();
  try {
    const result = await linkWithPopup(auth.currentUser, provider);
    console.log("Linked provider:", result.user.providerData);
  } catch (error: unknown) {
    const firebaseError = getErrorDetails(error);
    if (firebaseError.code === "auth/credential-already-in-use") {
      toast.error('That Meta account is already linked with another user.');
    } else {
      console.error(error);
      toast.error('Failed to link Meta account.');
    }
  }
}

async function linkTwitterAccount() {
  if(!auth.currentUser) return
  const provider = new TwitterAuthProvider();
  try {
    const result = await linkWithPopup(auth.currentUser, provider);
    console.log("Linked provider:", result.user.providerData);
  } catch (error: unknown) {
    const firebaseError = getErrorDetails(error);
    if (firebaseError.code === "auth/credential-already-in-use") {
      toast.error('That Twitter/X account is already linked with another user.');
    } else {
      console.error(error);
      toast.error('Failed to link Twitter/X account.');
    }
  }
}

async function linkMicrosoftAccount() {
  if(!auth.currentUser) return
  const provider = new OAuthProvider('microsoft.com');
  try {
    const result = await linkWithPopup(auth.currentUser, provider);
    console.log("Linked provider:", result.user.providerData);
  } catch (error: unknown) {
    const firebaseError = getErrorDetails(error);
    if (firebaseError.code === "auth/credential-already-in-use") {
      toast.error('That Microsoft account is already linked with another user.');
    } else {
      console.error(error);
      toast.error('Failed to link Microsoft account.');
    }
  }
}

const newDisplayName = ref('')

async function changeDisplayName() {
  if (!auth.currentUser) return;

  try {
    await updateProfile(auth.currentUser, { displayName: newDisplayName.value });
    toast.success('Display name updated.');
    console.log("New name:", auth.currentUser.displayName);
  } catch (error: unknown) {
    const firebaseError = getErrorDetails(error);
    console.error("Error updating display name:", error);
    toast.error(`Error: ${firebaseError.message ?? 'Unknown error'}`);
  }
}

const windowWidth = ref(window.innerWidth)

function openSettingsModal() {
  toggleSettingsModal.value = true;
  window.scrollY = 0;
  document.body.style.overflow = "hidden";
}

function closeSettingsModal() {
  toggleSettingsModal.value = false;
  document.body.style.overflow = "auto";
  document.body.style.overflowX = "hidden";
}
</script>
<template>
    <div class="meta-container">
        <h1 class="page-header">{{ title }}</h1>
        <button class="meta-button" @click="showNotifs = !showNotifs">
        <div class="icon-container">
            <component :is="iconHtml"></component>
        </div>
        <div v-if="showNotifs" class="notifications-dropdown">
          <div class="notif-block title-block">
            <label>Notifications</label>
          </div>
          <div class="notif-block" v-for="item in docsData" @click="$emit('notif-click', item)" ref="notifBlocks">
            <div class="label-track">
              <label class="title-label">{{ item[1].title }}</label>
              <label class="grade-label">{{ item[1].grade }}</label>
            </div>
            <div class="selection-track">
                <p>Has a request from {{ item[1].buyerName }}</p>
            </div>
          </div>
        </div>
        </button>
        <button class="meta-button" @click="openSettingsModal()">
          <div class="icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings-icon lucide-settings"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
        </button>
    </div>
    <div class="modal-settings-container" v-if="toggleSettingsModal">
      <div class="modal-settings-content">
        <div class="close-btn" @click="closeSettingsModal()"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></div>
        <div class="settings-sidebar">
          <div class="settings-sidebar-option main-sidebar-option">Settings</div>
          <div @click="selectedSettingOption = 'account'" class="settings-sidebar-option"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-icon lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Account</div>
          <div @click="selectedSettingOption = 'info'" class="settings-sidebar-option info-container"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg> Your Info</div>
        </div>
        <div class="text-container">
            <div class="content-container content-account" v-if="selectedSettingOption == 'account' || windowWidth <= 1025">
              <h1>Account Settings</h1>
              <div class="main-settings-account-container">
                <p><b>Name:</b> {{ userName }}</p>
                <p><b>Email:</b> {{ userEmail }}</p>
              </div>
              <div class="data-field-settings">
                <label>Change Password</label>
                <div class="side-btn-track">
                  <input class="form-input" placeholder="New password..." v-model="newPassword"></input>
                  <button class="apply-settings-btn" @click="resetPassword()">Submit</button>
                </div>
              </div>
              <div class="data-field-settings">
                <label>Manage Linked Accounts</label>
                <div class="linked-account-track">
                  <div class="linked-account" @click="linkGoogleAccount()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M564 325.8C564 467.3 467.1 568 324 568C186.8 568 76 457.2 76 320C76 182.8 186.8 72 324 72C390.8 72 447 96.5 490.3 136.9L422.8 201.8C334.5 116.6 170.3 180.6 170.3 320C170.3 406.5 239.4 476.6 324 476.6C422.2 476.6 459 406.2 464.8 369.7L324 369.7L324 284.4L560.1 284.4C562.4 297.1 564 309.3 564 325.8z"/></svg>
                    <p v-if="googleLinkedEmail == null || googleLinkedEmail == undefined">Link with Google</p>
                    <p v-if="googleLinkedEmail">{{ googleLinkedEmail }}</p>
                  </div>
                  <div class="linked-account" @click="linkMetaAccount()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M640 381.9C640 473.2 600.6 530.4 529.7 530.4C467.1 530.4 433.9 495.8 372.8 393.8L341.4 341.2C333.1 328.7 326.9 317 320.2 306.2C300.1 340 273.1 389.2 273.1 389.2C206.1 505.8 168.5 530.4 116.2 530.4C43.4 530.4 0 473.1 0 384.5C0 241.5 79.8 106.4 183.9 106.4C234.1 106.4 277.7 131.1 328.7 195.9C365.8 145.8 406.8 106.4 459.3 106.4C558.4 106.4 640 232.1 640 381.9zM287.4 256.2C244.5 194.1 216.5 175.7 183 175.7C121.1 175.7 69.2 281.8 69.2 385.7C69.2 434.2 87.7 461.4 118.8 461.4C149 461.4 167.8 442.4 222 357.6C222 357.6 246.7 318.5 287.4 256.2zM531.2 461.4C563.4 461.4 578.1 433.9 578.1 386.5C578.1 262.3 523.8 161.1 454.9 161.1C421.7 161.1 393.8 187 360 239.1C369.4 252.9 379.1 268.1 389.3 284.5L426.8 346.9C485.5 441 500.3 461.4 531.2 461.4z"/></svg>
                    <p v-if="facebookLinkedEmail == null || facebookLinkedEmail == undefined">Link with Meta</p>
                    <p v-if="facebookLinkedEmail">{{ facebookLinkedEmail }}</p>
                  </div>
                  <div class="linked-account" @click="linkTwitterAccount()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M523.4 215.7C523.7 220.2 523.7 224.8 523.7 229.3C523.7 368 418.1 527.9 225.1 527.9C165.6 527.9 110.4 510.7 64 480.8C72.4 481.8 80.6 482.1 89.3 482.1C138.4 482.1 183.5 465.5 219.6 437.3C173.5 436.3 134.8 406.1 121.5 364.5C128 365.5 134.5 366.1 141.3 366.1C150.7 366.1 160.1 364.8 168.9 362.5C120.8 352.8 84.8 310.5 84.8 259.5L84.8 258.2C98.8 266 115 270.9 132.2 271.5C103.9 252.7 85.4 220.5 85.4 184.1C85.4 164.6 90.6 146.7 99.7 131.1C151.4 194.8 229 236.4 316.1 240.9C314.5 233.1 313.5 225 313.5 216.9C313.5 159.1 360.3 112 418.4 112C448.6 112 475.9 124.7 495.1 145.1C518.8 140.6 541.6 131.8 561.7 119.8C553.9 144.2 537.3 164.6 515.6 177.6C536.7 175.3 557.2 169.5 576 161.4C561.7 182.2 543.8 200.7 523.4 215.7z"/></svg>
                    <p v-if="twitterLinkedEmail == null || twitterLinkedEmail == undefined">Link with Twitter/X</p>
                    <p v-if="twitterLinkedEmail">{{ twitterLinkedEmail }}</p>
                  </div>
                  <div class="linked-account" @click="linkMicrosoftAccount()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M96 96L310.6 96L310.6 310.6L96 310.6L96 96zM329.4 96L544 96L544 310.6L329.4 310.6L329.4 96zM96 329.4L310.6 329.4L310.6 544L96 544L96 329.4zM329.4 329.4L544 329.4L544 544L329.4 544L329.4 329.4z"/></svg>
                    <p v-if="microsoftLinkedEmail == null || microsoftLinkedEmail == undefined">Link with Microsoft</p>
                    <p v-if="microsoftLinkedEmail">{{ microsoftLinkedEmail }}</p>
                  </div>
                </div>
              </div>
              <div class="data-field-settings delete-field-settings">
                <label>Delete Account</label>
                <button class="delete-acc-btn" @click="deleteAccount()">Delete Account</button>
              </div>
            </div>
            <div class="content-container content-info" v-if="selectedSettingOption == 'info' || windowWidth <= 1025">
              <h1>Your Info Settings</h1>
              <div class="data-field-settings">
                <label>Display Name</label>
                <div class="side-btn-track">
                  <input class="form-input" placeholder="Enter display name..." v-model="newDisplayName"></input>
                  <button class="apply-settings-btn" @click="changeDisplayName()">Submit</button>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
</template>
<style lang="scss" scoped>
.meta-container {
    width: 100%;
    display: flex;
    align-items: center;
}
.page-header {
    font-family: 'Manrope';
    margin-right: auto;
    color: $color-accent;
}
.meta-button {
    position: relative;
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    border: none;
    background-color: transparent;
    cursor: pointer;
    padding: 0;
    .icon-container {
        @extend %filler;
        @extend %centered;
        :deep(svg) {
            width: 20px;
            height: 20px;
            max-width: 20px;
            max-height: 20px;
        }
    }
}
.notifications-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  max-height: 40dvh;
  overflow-y: scroll;
  background-color: $color-background;
  border-radius: 10px;
  border: 1px solid rgba(211, 211, 211, 0.5);
  z-index: 999;
  .notif-block {
    width: 100%;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    row-gap: 6px;
    border-bottom: 1px solid rgba(211, 211, 211, 0.5);
    .label-track {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: 'Nunito';
      .title-label {
        max-width: 70%;
        width: 70%;
        text-overflow: ellipsis;
        text-wrap: nowrap;
        white-space: nowrap;
        overflow: hidden;
        text-align: left;
      }
      .grade-label {
        max-width: 25%;
        width: 25%;
        text-overflow: ellipsis;
        text-wrap: nowrap;
        white-space: nowrap;
        overflow: hidden;
        text-align: right;
      }
    }
    .submit-track {
      button {
        font-size: 12px;
        cursor: pointer;
      }
      .delete-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
        border-radius: 10px;
        border: 1px solid rgba(211, 211, 211);
        padding: 0.5vw;
        column-gap: 5px;
      }
      .apply-btn {
        background-color: $color-primary;
        color: white;
        border-radius: 10px;
        border: 1px solid rgba(211, 211, 211);
        padding: 0.5vw;
      }
    }
    .selection-track {
      @extend %filler;
      display: flex;
      p {
        font-family: 'Nunito';
      }
    }
  }
  .title-block {
    label {
      font-family: 'Manrope';
    }
  }
}
::-webkit-scrollbar {
    width: 0;
}
@media screen and (max-width: 1025px) {
  .modal-settings-content {
    flex-direction: column;
  }
  .settings-sidebar {
    display: none;
  }
  .text-container {
    width: 100%;
    height: 100%;
  }
  .page-header {
    font-size: px-to-vw(60);
  }
  .meta-button {
    margin-left: 1rem;
  }
  .notifications-dropdown {
    width: 30vw;
  }
  .title-block {
    label {
      font-size: px-to-vw(40);
    }
  }
  .label-track {
    .title-label {
      font-size: px-to-vw(35);
    }
    .grade-label {
      font-size: px-to-vw(30);
    }
  }
  .selection-track {
    font-size: px-to-vw(30);
  }
}
@media screen and (min-width: 1025px) {
  .settings-sidebar {
    display: flex;
  }
  .text-container {
    width: 90%;
    height: 100%;
  }
  .page-header {
    font-size: px-to-vw(35);
  }
  .meta-button {
    margin-left: 1rem;
  }
  .notifications-dropdown {
    width: 12vw;
  }
  .title-block {
    label {
      font-size: px-to-vw(16);
    }
  }
  .label-track {
    .title-label {
      font-size: px-to-vw(13);
    }
    .grade-label {
      font-size: px-to-vw(10);
    }
  }
  .selection-track {
    font-size: px-to-vw(11);
  }
}
@media screen and (max-width: 950px) {
  .page-header {
    font-size: px-to-vw(50);
  }
  .meta-button {
    margin-left: 1rem;
  }
  .notifications-dropdown {
    width: 30vw;
  }
  .title-block {
    label {
      font-size: px-to-vw(40);
    }
  }
  .label-track {
    .title-label {
      font-size: px-to-vw(35);
    }
    .grade-label {
      font-size: px-to-vw(30);
    }
  }
  .selection-track {
    font-size: px-to-vw(30);
  }
}
@media screen and (max-width: 550px) {
  .page-header {
    font-size: px-to-vw(70);
  }
  .meta-button {
    height: 32%;
    margin-left: 4vw;
  }
  .notifications-dropdown {
    width: 40vw;
  }
  .title-block {
    label {
      font-size: px-to-vw(60);
    }
  }
  .label-track {
    .title-label {
      font-size: px-to-vw(45);
    }
    .grade-label {
      font-size: px-to-vw(35);
    }
  }
  .selection-track {
    font-size: px-to-vw(35);
  }
}
.modal-settings-container {
  position: absolute;
  width: 100%;
  height: 100vh;
  left: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 999;
  @extend %centered;
  .modal-settings-content {
    position: relative;
    width: 75%;
    height: 80%;
    background-color: $color-background;
    border-radius: 20px;
    display: flex;
    .settings-sidebar {
      overflow: hidden;
      width: 10%;
      height: 100%;
      background-color: $color-accent-lightened;
      border-top-left-radius: 20px;
      border-bottom-left-radius: 20px;
      flex-direction: column;
      text-align: center;
      color: white;
      font-family: 'Nunito';
      row-gap: 1vw;
      .settings-sidebar-option {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        column-gap: 5px;
        :deep(svg) {
          width: 20%;
          aspect-ratio: 1/1;
        }
        cursor: pointer;
      }
      .main-sidebar-option {
        height: 4vw;
        width: 100%;
        svg {
          height: 100%;
          aspect-ratio: 1/1;
        }
      }
      .info-container {
        :deep(svg) {
          width: 17.5%;
          aspect-ratio: 1/1;
        }
      }
    }
    .text-container {
      overflow-y: scroll;
      padding: 3vw;
      display: flex;
      flex-direction: column;
      row-gap: 30px;
      overflow-y: scroll;
      .content-container {
        position: relative;
        width: 100%;
        display: flex;
        flex-direction: column;
        row-gap: 20px;
        max-height: 100%;
        h1 {
          font-family: 'Manrope';
        }
        .data-field-settings {
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          row-gap: 5px;
          font-family: 'Nunito';
          .multiselect-wrapper {
            height: 100%;
            @extend %centered;
          }
          .linked-account-track {
            white-space: nowrap;
            width: auto;
            height: 100%;
            padding: 5px 0;
            overflow-x: scroll;
          
            .linked-account {
              display: inline-flex;
              align-items: center;
              margin-right: 10px;
              border-radius: 10px;
              border: 2px solid $color-primary;
              cursor: pointer;
              overflow: hidden;
              column-gap: 10px;
              svg {
                height: 2vh;
                width: 15%;
              }
            }
          }
          .side-btn-track {
            display: flex;
            align-items: center;
            column-gap: 10px;
            width: 100%;
            height: 50%;
            .apply-settings-btn {
              background-color: transparent;
              border: 2px solid $color-primary;
              border-radius: 20px;
              cursor: pointer;
              font-family: 'Nunito';
              transition: background 300ms ease, color 300ms ease;
              &:hover {
                background-color: $color-primary;
                color: white;
              }
            }
          }
        }
        .delete-field-settings {
          width: 100%;
          .delete-acc-btn {
            width: fit-content;
            background-color: transparent;
            border: 2px solid #ff9b9b;
            border-radius: 20px;
            cursor: pointer;
            font-family: 'Nunito';
            transition: background 300ms ease, color 300ms ease;
            &:hover {
              background-color: #ff9b9b;
              color: white;
            }
          }
        }
      }
      .content-account {
        .main-settings-account-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          row-gap: 20px;
          font-family: 'Nunito';
        }
      }
    }
    .close-btn {
      position: absolute;
      top: 1.25%;
      right: 2%;
      cursor: pointer;
      z-index: 999;
      width: 40px;
      aspect-ratio: 1/1;
      @extend %centered;
      svg {
        width: 50%;
        aspect-ratio: 1/1;
      }
    }
  }
}
.form-input {
  width: fit-content;
  padding: 0.5vw 1vw;
  border-radius: 5px;
  border: 1px solid lightgray;
}
@media screen and (min-width: 1025px) {
  .form-input, .main-settings-account-container {
    font-size: px-to-vw(15);
  }
  .multiselect-wrapper {
    width: 30%;
  }
  .apply-settings-btn, .delete-acc-btn, .linked-account {
    padding: 0.5vw 1vw;
    font-size: px-to-vw(15);
  }
  .data-field-settings {
    label {
      font-size: px-to-vw(17);
    }
  }
  .content-container {
    h1 {
      font-size: px-to-vw(40);
    }
  }
  .linked-account {
    p {
      font-size: px-to-vw(15);
    }
  }
}
@media screen and (max-width: 1025px) {
  .form-input, .main-settings-account-container {
    font-size: px-to-vw(20);
  }
  .multiselect-wrapper {
    width: 40%;
  }
  .apply-settings-btn, .delete-acc-btn, .linked-account {
    padding: 0.5vw 1vw;
    font-size: px-to-vw(20);
  }
  .data-field-settings {
    label {
      font-size: px-to-vw(24);
    }
  }
  .content-container {
    h1 {
      font-size: px-to-vw(48);
    }
  }
}
@media screen and (max-width: 950px) {
  .form-input, .main-settings-account-container {
    font-size: px-to-vw(30);
  }
  .multiselect-wrapper {
    width: 50%;
  }
  .apply-settings-btn, .delete-acc-btn, .linked-account {
    padding: 0.5vw 1vw;
    font-size: px-to-vw(30);
  }
  .data-field-settings {
    label {
      font-size: px-to-vw(38);
    }
  }
  .content-container {
    h1 {
      font-size: px-to-vw(55);
    }
  }
}
@media screen and (max-width: 550px) {
  .form-input, .main-settings-account-container {
    font-size: px-to-vw(50);
  }
  .multiselect-wrapper {
    width: 60%;
  }
  .apply-settings-btn, .delete-acc-btn, .linked-account {
    padding: 1vw 2vw;
    font-size: px-to-vw(50);
  }
  .data-field-settings {
    label {
      font-size: px-to-vw(62);
    }
  }
  .content-container {
    h1 {
      font-size: px-to-vw(80);
    }
  }
  .linked-account-track {
    width: 200%;
  }
  .linked-account {
    p {
      font-size: px-to-vw(50);
    }
  }
}

::-webkit-scrollbar {
  height: 0.5vw;
}
</style>
