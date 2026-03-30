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

async function fetchOpenLibraryData(isbnCode: string) {
  const raw = isbnCode.replace(/[-\s]/g, '');
  if (!ISBN.isValid(raw)) return null;

  const parsed = ISBN.parse(raw) as ISBN.ISBN;
  const isbn13 = parsed.asIsbn13();
  const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn13}&jscmd=data&format=json`);
  const data = await response.json();
  return data[`ISBN:${isbn13}`] ?? null;
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
  const autoFilled = ref<{ grade: boolean; subject: boolean }>({ grade: false, subject: false });

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
    const raw = isbn.value.replace(/[-\s]/g, '');
    if (!raw) return null;
    return ISBN.isValid(raw);
  });

  function setField(field: 'isbn' | 'title' | 'grade' | 'subject' | 'name', value: string, manual = true) {
    if (field === 'isbn') isbn.value = value;
    if (field === 'title') title.value = value;
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

  function dismissAutofill(field: 'grade' | 'subject') {
    autoFilled.value[field] = false;
  }

  function applyAutofill(inference: { grade: MetadataValue; subject: MetadataValue }) {
    if (inference.grade && !grade.value) {
      grade.value = inference.grade;
      autoFilled.value.grade = true;
    }
    if (inference.subject && !subject.value) {
      subject.value = inference.subject;
      autoFilled.value.subject = true;
    }
  }

  async function runIsbnLookup() {
    if (!isbn.value) return;

    if (isbnToTitle[isbn.value]) {
      title.value ||= isbnToTitle[isbn.value];
    }

    const mappedSubject = isbnToSubject[isbn.value];
    const mappedGrade = isbnToGrade[isbn.value];
    applyAutofill({
      grade: mappedGrade ? formatGradeName(mappedGrade) : null,
      subject: mappedSubject ?? null
    });

    isbnLookupLoading.value = true;
    try {
      const openLibraryData = await fetchOpenLibraryData(isbn.value);
      if (!openLibraryData) return;

      title.value ||= openLibraryData.title ?? '';
      applyAutofill(
        inferMetadataFromText(
          [
            openLibraryData.title,
            openLibraryData.subtitle,
            ...(openLibraryData.subjects?.map((entry: { name?: string; }) => entry.name || '') ?? [])
          ]
            .filter(Boolean)
            .join(' ')
        )
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
    if (requiredFields.includes('grade') && !grade.value.trim()) nextErrors.grade = 'Grade is required.';
    if (requiredFields.includes('subject') && !subject.value.trim()) nextErrors.subject = 'Subject is required.';
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
    autoFilled.value = { grade: false, subject: false };
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
