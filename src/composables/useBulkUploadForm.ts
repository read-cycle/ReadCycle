import { computed, ref } from 'vue';
import { schoolBookMappings } from '../assets/BookMappings';

type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error';

function formatGradeName(raw: string) {
  if (/^\d+$/.test(raw)) return `Grade ${raw}`;
  return raw;
}

export function useBulkUploadForm() {
  const school = ref('');
  const grade = ref('');
  const name = ref('');
  const price = ref(0);
  const quantity = ref(1);
  const errors = ref<Record<string, string>>({});
  const status = ref<SubmissionStatus>('idle');

  const schoolOptions = Object.keys(schoolBookMappings);
  const selectedMapping = computed(() => schoolBookMappings[school.value] ?? null);
  const gradeOptions = computed(() => {
    const mapping = selectedMapping.value;
    if (!mapping) return [];

    return Array.from(new Set(Object.values(mapping.isbnToGrade)))
      .map((value) => ({
        value,
        label: formatGradeName(value)
      }))
      .sort((left, right) => left.label.localeCompare(right.label, undefined, { numeric: true }));
  });

  function setField(field: 'school' | 'grade' | 'name', value: string): void;
  function setField(field: 'price' | 'quantity', value: number): void;
  function setField(field: 'school' | 'grade' | 'name' | 'price' | 'quantity', value: string | number) {
    if (field === 'school') school.value = value;
    if (field === 'grade') grade.value = value;
    if (field === 'name') name.value = value;
    if (field === 'price') price.value = typeof value === 'number' ? value : Number(value) || 0;
    if (field === 'quantity') quantity.value = typeof value === 'number' ? value : Number(value) || 1;
  }

  function validate(requiredFields: Array<'school' | 'grade' | 'name' | 'quantity'>) {
    const nextErrors: Record<string, string> = {};

    if (requiredFields.includes('school') && !school.value.trim()) nextErrors.school = 'School is required.';
    if (requiredFields.includes('grade') && !grade.value.trim()) nextErrors.grade = 'Grade is required.';
    if (requiredFields.includes('name') && !name.value.trim()) nextErrors.name = 'Display name is required.';
    if (price.value < 0) nextErrors.price = 'Price cannot be negative.';
    if (requiredFields.includes('quantity') && (!quantity.value || quantity.value < 1)) nextErrors.quantity = 'Quantity must be at least 1.';

    errors.value = nextErrors;
    return Object.keys(nextErrors).length === 0;
  }

  function reset(defaults?: Partial<{ school: string; grade: string; name: string; price: number; quantity: number; }>) {
    school.value = defaults?.school ?? '';
    grade.value = defaults?.grade ?? '';
    name.value = defaults?.name ?? '';
    price.value = defaults?.price ?? 0;
    quantity.value = defaults?.quantity ?? 1;
    errors.value = {};
    status.value = 'idle';
  }

  return {
    school,
    grade,
    name,
    price,
    quantity,
    errors,
    status,
    schoolOptions,
    selectedMapping,
    gradeOptions,
    setField,
    validate,
    reset
  };
}
