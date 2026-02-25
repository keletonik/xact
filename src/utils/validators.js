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
  if (isNaN(num) || num < 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
}

export function validEmail(value) {
  if (!value) return null;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(value)) {
    return 'Invalid email address';
  }
  return null;
}

export function validPhone(value) {
  if (!value) return null;
  const re = /^[\d\s+()-]{8,20}$/;
  if (!re.test(value)) {
    return 'Invalid phone number';
  }
  return null;
}

export function inRange(value, min, max, fieldName = 'Value') {
  const num = Number(value);
  if (isNaN(num)) return `${fieldName} must be a number`;
  if (num < min || num > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }
  return null;
}

export function validateEstimateLine(line) {
  const errors = {};
  if (!line.description) errors.description = 'Description is required';
  if (line.quantity == null || line.quantity < 0) errors.quantity = 'Valid quantity required';
  if (line.unitRate == null || line.unitRate < 0) errors.unitRate = 'Valid unit rate required';
  return Object.keys(errors).length > 0 ? errors : null;
}

export function validateAssembly(assembly) {
  const errors = {};
  if (!assembly.name) errors.name = 'Assembly name is required';
  if (!assembly.items || assembly.items.length === 0) {
    errors.items = 'Assembly must have at least one item';
  }
  return Object.keys(errors).length > 0 ? errors : null;
}

export function detectAnomalies(estimateLines) {
  const flags = [];

  for (const line of estimateLines) {
    if (line.total < 0) {
      flags.push({
        lineId: line.id,
        type: 'negative_total',
        message: `Line "${line.description}" has a negative total: ${line.total}`,
        severity: 'error',
      });
    }

    if (line.unitRate > 50000) {
      flags.push({
        lineId: line.id,
        type: 'high_unit_price',
        message: `Line "${line.description}" has an unusually high unit rate: ${line.unitRate}`,
        severity: 'warning',
      });
    }

    if (line.quantity === 0 && line.unitRate > 0) {
      flags.push({
        lineId: line.id,
        type: 'zero_quantity',
        message: `Line "${line.description}" has zero quantity with non-zero rate`,
        severity: 'warning',
      });
    }
  }

  return flags;
}
