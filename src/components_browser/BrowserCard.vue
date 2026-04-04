<script setup lang="ts">
import type { Timestamp } from 'firebase/firestore';
import AppImage from '../components/AppImage.vue';
import type { UploadDoc } from '../interfaces';
import { getDisplayImageUrl } from '../utils/imageUrls';
const props = defineProps<{
 data: UploadDoc
}>()

function getListingImage(image: UploadDoc['listingImage']) {
  return Array.isArray(image) ? image[0] : image;
}

function getListingThumbnail(doc: UploadDoc) {
  return getDisplayImageUrl(doc.listingImageThumb, getListingImage(doc.listingImage));
}
function formatTimestampToDDMMYY(ts: Timestamp) {
  const date = ts.toDate()
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  return `${day}/${month}/${year}`
}
</script>
<template>
<div class="card-container browsercard-container">
    <div class="image-container">
        <AppImage :src="getListingThumbnail(data)" :alt="`Cover of ${props.data.title || 'book listing'}`" class="image-container__img" />
    </div>
    <div class="text-container">
        <div class="main-text-container">
            <h1 class="text-container-header">{{ props.data.title }}</h1>
            <p class="text-container-para">{{ props.data.grade }}</p>
            <p class="text-container-meta">{{ props.data.subject || 'General' }}</p>
        </div>
        <div class="metadata-container">
            <p class="metadata-pill">Qty {{ props.data.quantity ?? 0 }}</p>
            <p class="metadata-pill">₹{{ props.data.price ?? 0 }}</p>
            <p>{{ formatTimestampToDDMMYY(props.data.timestamp) }}</p>
        </div>
    </div>
</div>
</template>
<style lang="scss" scoped>
.card-container {
    width: 100%;
    min-width: 0;
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    background-color: #f9fafb;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 5px 5px 10px 1px #ccc;
    .image-container {
        min-height: 180px;
        height: 60%;
        width: 100%;
        overflow: hidden;
    }
    .image-container__img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .text-container {
        height: 40%;
        width: 100%;
        padding: 0 1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        column-gap: 0.75rem;
        .metadata-container {
            flex: 0 0 auto;
            height: 100%;
            font-family: 'Nunito';
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: center;
            gap: 0.25rem;
            p {
              margin: 0;
            }
            .metadata-pill {
              padding: 0.2rem 0.5rem;
              border-radius: 999px;
              background: rgba(58, 122, 254, 0.1);
            }
        }
        .main-text-container {
            flex: 1 1 auto;
            min-width: 0;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            .text-container-header {
                width: 100%;
                font-size: 18px;
                font-family: 'Manrope';
                color: $color-accent;
                max-width: 100%;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
            }
            .text-container-para {
                font-size: 15px;
                font-family: 'Nunito';
                max-width: 100%;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;        
            }
            .text-container-meta {
                font-size: 13px;
                font-family: 'Nunito';
                color: rgba(15, 23, 42, 0.65);
                max-width: 100%;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                margin: 0;
            }
        }
    }
}
</style>
