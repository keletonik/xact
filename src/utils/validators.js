export function required(value, fieldName = 'Field') {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  return null;
}

export function minLength(value, min, fieldName = 'Field') {
  if (value && value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  return null;
}

export function maxLength(value, max, fieldName = 'Field') {
  if (value && value.length > max) {
    return `${fieldName} must be no more than ${max} characters`;
  }
  return null;
}

export function positiveNumber(value, fieldName = 'Field') {
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
}

export function validEmail(value) {
  if (!value) return null;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(value)) return 'Invalid email address';
  return null;
}

export function validPhone(value) {
  if (!value) return null;
  const re = /^[\d\s+()-]{8,20}$/;
  if (!re.test(value)) return 'Invalid phone number';
  return null;
}

export function inRange(value, min, max, fieldName = 'Value') {
  const num = Number(value);
  if (Number.isNaN(num)) return `${fieldName} must be a number`;
  if (num < min || num > max) return `${fieldName} must be between ${min} and ${max}`;
  return null;
}

const FRL_RE = /^(-|\d{1,3})\/(-|\d{1,3})\/(-|\d{1,3})$/;

export function validFrl(value) {
  if (!value) return 'FRL is required';
  if (!FRL_RE.test(value.trim())) {
    return "FRL must be three slash-separated values, e.g. '-/120/120'";
  }
  return null;
}
