import { computed, ref } from 'vue';
import ISBN from 'isbn-utils';
import type { MetadataValue } from '../interfaces';
import { isbnToGrade, isbnToSubject, isbnToTitle, titleToGrade, titleToIsbn, titleToSubject } from '../assets/BookMappings';

type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error';

const SUBJECT_MATCHES = [
  'Mathematics',
  'Biology',
  'History',
  'English',
  'Physics',
  'Chemistry',
  'Geography',
  'Science',
  'Economics',
  'Commerce',
  'Accounting'
] as const;

const GRADE_REGEX = /\b(?:grade|class|year|standard|std|form)\s*(\d{1,2})\b/i;

function formatGradeName(raw: string) {
  const value = raw.toLowerCase();
  if (value === 'bp') return 'Bridge Program';
  if (/^g\d+$/i.test(value)) return `Grade ${value.slice(1)}`;
  if (/^\d+$/.test(value)) return `Grade ${value}`;
  return raw;
}

function inferMetadataFromText(text: string) {
  const lower = text.toLowerCase();
  const gradeMatch = text.match(GRADE_REGEX);
  const subjectMatch = SUBJECT_MATCHES.find((subject) => lower.includes(subject.toLowerCase()));

  return {
    grade: gradeMatch ? `Grade ${gradeMatch[1]}` : null,
    subject: subjectMatch ?? null
  };
}

type OpenLibraryBook = {
  title?: string;
  subtitle?: string;
  subjects?: Array<{ name?: string; }>;
};

type GoogleBooksVolume = {
  volumeInfo?: {
    title?: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    categories?: string[];
  };
};

function normalizeIsbnInput(isbnCode: string) {
  return isbnCode.replace(/[-\s]/g, '').toUpperCase();
}

function getIsbnCandidates(isbnCode: string) {
  const raw = normalizeIsbnInput(isbnCode);
  if (!ISBN.isValid(raw)) return [];

  const parsed = ISBN.parse(raw) as ISBN.ISBN;
  const candidates = [raw, parsed.asIsbn13(), parsed.asIsbn10()].filter((value): value is string => Boolean(value));
  return Array.from(new Set(candidates));
}

async function fetchOpenLibraryData(isbnCode: string) {
  const candidates = getIsbnCandidates(isbnCode);
  const isbn13 = candidates.find((candidate) => candidate.length === 13);
  if (!isbn13) return null;

  const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn13}&jscmd=data&format=json`);
  const data = await response.json() as Record<string, OpenLibraryBook>;
  return data[`ISBN:${isbn13}`] ?? null;
}

async function fetchGoogleBooksData(isbnCode: string) {
  const candidates = getIsbnCandidates(isbnCode);
  const isbnQuery = candidates.find((candidate) => candidate.length === 13) ?? candidates[0];
  if (!isbnQuery) return null;

  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbnQuery}`);
  const data = await response.json() as { items?: GoogleBooksVolume[]; };
  return data.items?.[0] ?? null;
}

function scoreBookData(entry: {
  title?: string;
  subtitle?: string;
  description?: string;
  subjects?: string[];
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
}) {
  return [
    entry.title,
    entry.subtitle,
    entry.description,
    entry.publisher,
    entry.publishedDate,
    ...(entry.subjects ?? []),
    ...(entry.authors ?? [])
  ]
    .filter(Boolean)
    .join(' ')
    .length;
}

function chooseBestExternalBookData(openLibraryData: OpenLibraryBook | null, googleBooksData: GoogleBooksVolume | null) {
  const googleVolumeInfo = googleBooksData?.volumeInfo;

  const openLibraryScore = openLibraryData
    ? scoreBookData({
        title: openLibraryData.title,
        subtitle: openLibraryData.subtitle,
        subjects: openLibraryData.subjects?.map((entry) => entry.name || '').filter(Boolean)
      })
    : 0;

  const googleBooksScore = googleVolumeInfo
    ? scoreBookData({
        title: googleVolumeInfo.title,
        subtitle: googleVolumeInfo.subtitle,
        description: googleVolumeInfo.description,
        subjects: googleVolumeInfo.categories,
        authors: googleVolumeInfo.authors,
        publisher: googleVolumeInfo.publisher,
        publishedDate: googleVolumeInfo.publishedDate
      })
    : 0;

  if (googleBooksScore > openLibraryScore) {
    return {
      title: googleVolumeInfo?.title ?? '',
      metadataSource: [
        googleVolumeInfo?.title,
        googleVolumeInfo?.subtitle,
        googleVolumeInfo?.description,
        ...(googleVolumeInfo?.categories ?? [])
      ]
        .filter(Boolean)
        .join(' ')
    };
  }

  return {
    title: openLibraryData?.title ?? '',
    metadataSource: [
      openLibraryData?.title,
      openLibraryData?.subtitle,
      ...(openLibraryData?.subjects?.map((entry) => entry.name || '') ?? [])
    ]
      .filter(Boolean)
      .join(' ')
  };
}

export function useForm() {
  const isbn = ref('');
  const title = ref('');
  const grade = ref('');
  const subject = ref('');
  const price = ref<number | null>(0);
  const quantity = ref<number>(1);
  const name = ref('');
  const errors = ref<Record<string, string>>({});
  const status = ref<SubmissionStatus>('idle');
  const isbnLookupLoading = ref(false);
  const autoFilled = ref<{ title: boolean; grade: boolean; subject: boolean }>({ title: false, grade: false, subject: false });

  const isbnOptions = Object.keys(isbnToTitle);
  const titleOptions = Object.keys(titleToIsbn);
  const gradeOptions = [
    'Grade 1',
    'Grade 2',
    'Grade 3',
    'Grade 4',
    'Grade 5',
    'Grade 6',
    'Grade 7',
    'Grade 8',
    'Grade 9',
    'Grade 10',
    'Grade 11 AS',
    'Grade 12 AS',
    'Bridge Program'
  ];
  const subjectOptions = Array.from(new Set(Object.values(isbnToSubject)));
  const isbnValidity = computed<null | boolean>(() => {
    const raw = normalizeIsbnInput(isbn.value);
    if (!raw) return null;
    return ISBN.isValid(raw);
  });

  function setField(field: 'isbn' | 'title' | 'grade' | 'subject' | 'name', value: string, manual = true) {
    if (field === 'isbn') isbn.value = value;
    if (field === 'title') {
      title.value = value;
      if (manual) autoFilled.value.title = false;
    }
    if (field === 'grade') {
      grade.value = value;
      if (manual) autoFilled.value.grade = false;
    }
    if (field === 'subject') {
      subject.value = value;
      if (manual) autoFilled.value.subject = false;
    }
    if (field === 'name') name.value = value;
  }

  function dismissAutofill(field: 'title' | 'grade' | 'subject') {
    autoFilled.value[field] = false;
  }

  function applyAutoFilledValue(field: 'title' | 'grade' | 'subject', nextValue: MetadataValue) {
    if (!nextValue) return;

    if (field === 'title') {
      title.value = nextValue;
      autoFilled.value.title = true;
    }
    if (field === 'grade') {
      grade.value = nextValue;
      autoFilled.value.grade = true;
    }
    if (field === 'subject') {
      subject.value = nextValue;
      autoFilled.value.subject = true;
    }
  }

  function applyAutofill(inference: { title?: MetadataValue; grade: MetadataValue; subject: MetadataValue }) {
    applyAutoFilledValue('title', inference.title ?? null);
    applyAutoFilledValue('grade', inference.grade);
    applyAutoFilledValue('subject', inference.subject);
  }

  async function runIsbnLookup() {
    if (!isbn.value) return;

    const normalizedIsbn = normalizeIsbnInput(isbn.value);
    if (!normalizedIsbn) return;

    isbn.value = normalizedIsbn;

    const candidates = getIsbnCandidates(normalizedIsbn);
    const mappedTitle = candidates.map((candidate) => isbnToTitle[candidate]).find(Boolean);
    const mappedSubject = candidates.map((candidate) => isbnToSubject[candidate]).find(Boolean);
    const mappedGrade = candidates.map((candidate) => isbnToGrade[candidate]).find(Boolean);

    applyAutofill({
      title: mappedTitle ?? null,
      grade: mappedGrade ? formatGradeName(mappedGrade) : null,
      subject: mappedSubject ?? null
    });

    if (mappedTitle || mappedSubject || mappedGrade) {
      return;
    }

    isbnLookupLoading.value = true;
    try {
      const [openLibraryData, googleBooksData] = await Promise.all([
        fetchOpenLibraryData(normalizedIsbn),
        fetchGoogleBooksData(normalizedIsbn)
      ]);
      const bestBookData = chooseBestExternalBookData(openLibraryData, googleBooksData);
      if (!bestBookData.metadataSource) return;

      applyAutofill(
        {
          title: bestBookData.title,
          ...inferMetadataFromText(bestBookData.metadataSource)
        }
      );
    } catch (error) {
      console.error('ISBN lookup failed:', error);
    } finally {
      isbnLookupLoading.value = false;
    }
  }

  function inferFromTitle() {
    const titleValue = title.value.trim();
    if (!titleValue) return;

    if (titleToIsbn[titleValue] && !isbn.value) {
      isbn.value = titleToIsbn[titleValue];
    }

    const mappedSubject = titleToSubject[titleValue];
    const mappedGrade = titleToGrade[titleValue];

    applyAutofill({
      title: null,
      grade: mappedGrade ? formatGradeName(mappedGrade) : inferMetadataFromText(titleValue).grade,
      subject: mappedSubject ?? inferMetadataFromText(titleValue).subject
    });
  }

  function getPayloadValue(value: string) {
    const normalizedValue = value.trim();
    return normalizedValue ? normalizedValue : null;
  }

  function validate(requiredFields: Array<'isbn' | 'title' | 'grade' | 'subject' | 'name' | 'quantity'>) {
    const nextErrors: Record<string, string> = {};

    if (requiredFields.includes('isbn') && !isbn.value.trim()) nextErrors.isbn = 'ISBN is required.';
    if (requiredFields.includes('isbn') && isbn.value.trim() && isbnValidity.value === false) nextErrors.isbn = 'ISBN must be valid.';
    if (requiredFields.includes('title') && !title.value.trim()) nextErrors.title = 'Title is required.';
    if (requiredFields.includes('name') && !name.value.trim()) nextErrors.name = 'Name is required.';
    if (requiredFields.includes('quantity') && (!quantity.value || quantity.value < 1)) nextErrors.quantity = 'Quantity must be at least 1.';

    errors.value = nextErrors;
    return Object.keys(nextErrors).length === 0;
  }

  function reset(defaults?: Partial<{
    isbn: string;
    title: string;
    grade: string;
    subject: string;
    price: number | null;
    quantity: number;
    name: string;
  }>) {
    isbn.value = defaults?.isbn ?? '';
    title.value = defaults?.title ?? '';
    grade.value = defaults?.grade ?? '';
    subject.value = defaults?.subject ?? '';
    price.value = defaults?.price ?? 0;
    quantity.value = defaults?.quantity ?? 1;
    name.value = defaults?.name ?? '';
    errors.value = {};
    status.value = 'idle';
    autoFilled.value = { title: false, grade: false, subject: false };
  }

  const payload = computed(() => ({
    isbn: getPayloadValue(isbn.value),
    title: getPayloadValue(title.value),
    grade: getPayloadValue(grade.value),
    subject: getPayloadValue(subject.value),
    price: price.value ?? 0,
    quantity: quantity.value,
    name: name.value.trim()
  }));

  return {
    isbn,
    title,
    grade,
    subject,
    price,
    quantity,
    name,
    errors,
    status,
    isbnLookupLoading,
    isbnValidity,
    autoFilled,
    isbnOptions,
    titleOptions,
    gradeOptions,
    subjectOptions,
    setField,
    dismissAutofill,
    runIsbnLookup,
    inferFromTitle,
    validate,
    payload,
    reset
  };
}
