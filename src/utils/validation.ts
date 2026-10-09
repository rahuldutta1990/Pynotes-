/**
 * PyNotes Comprehensive Validation Utilities
 * Handles validation for all customer, checkout, admin, shipping, and claim workflows.
 */

// Strict RFC 5322-compliant email regex pattern
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Indian Mobile Number: 10 digits starting with 6, 7, 8, or 9
const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;

// Indian PIN Code: 6 digits, first digit cannot be 0
const INDIAN_PINCODE_REGEX = /^[1-9][0-9]{5}$/;

// GSTIN: 15-character Indian Goods and Services Tax Identification Number
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export function validateEmail(email: string): ValidationResult {
  const trimmed = email ? email.trim() : '';
  if (!trimmed) {
    return { isValid: false, message: 'Email address is required.' };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, message: 'Please enter a valid email address (e.g. student@college.edu).' };
  }
  return { isValid: true };
}

export function validatePhone(phone: string): ValidationResult {
  const clean = phone ? phone.replace(/\D/g, '') : '';
  if (!clean) {
    return { isValid: false, message: 'Mobile number is required for SMS delivery updates.' };
  }
  if (clean.length !== 10) {
    return { isValid: false, message: `Mobile number must be exactly 10 digits (${clean.length}/10 entered).` };
  }
  if (!INDIAN_PHONE_REGEX.test(clean)) {
    return { isValid: false, message: 'Please enter a valid Indian mobile number starting with 6, 7, 8, or 9.' };
  }
  return { isValid: true };
}

export interface PincodeValidationResult extends ValidationResult {
  detectedState?: string;
}

// Indian postal circle prefix to state mapping
const PINCODE_PREFIX_MAP: Record<string, string> = {
  '11': 'Delhi NCR',
  '12': 'Haryana',
  '13': 'Haryana',
  '14': 'Punjab',
  '15': 'Punjab',
  '16': 'Chandigarh',
  '17': 'Himachal Pradesh',
  '18': 'Jammu & Kashmir',
  '19': 'Jammu & Kashmir',
  '20': 'Uttar Pradesh',
  '21': 'Uttar Pradesh',
  '22': 'Uttar Pradesh',
  '24': 'Uttarakhand',
  '25': 'Uttar Pradesh',
  '26': 'Uttarakhand',
  '27': 'Uttar Pradesh',
  '28': 'Uttar Pradesh',
  '30': 'Rajasthan',
  '31': 'Rajasthan',
  '32': 'Rajasthan',
  '33': 'Rajasthan',
  '34': 'Rajasthan',
  '36': 'Gujarat',
  '37': 'Gujarat',
  '38': 'Gujarat',
  '39': 'Gujarat',
  '40': 'Maharashtra',
  '41': 'Maharashtra',
  '42': 'Maharashtra',
  '43': 'Maharashtra',
  '44': 'Maharashtra',
  '45': 'Madhya Pradesh',
  '46': 'Madhya Pradesh',
  '47': 'Madhya Pradesh',
  '48': 'Madhya Pradesh',
  '49': 'Chhattisgarh',
  '50': 'Telangana',
  '51': 'Andhra Pradesh',
  '52': 'Andhra Pradesh',
  '53': 'Andhra Pradesh',
  '56': 'Karnataka',
  '57': 'Karnataka',
  '58': 'Karnataka',
  '59': 'Karnataka',
  '60': 'Tamil Nadu',
  '61': 'Tamil Nadu',
  '62': 'Tamil Nadu',
  '63': 'Tamil Nadu',
  '64': 'Tamil Nadu',
  '67': 'Kerala',
  '68': 'Kerala',
  '69': 'Kerala',
  '70': 'West Bengal',
  '71': 'West Bengal',
  '72': 'West Bengal',
  '73': 'West Bengal',
  '74': 'West Bengal',
  '75': 'Odisha',
  '76': 'Odisha',
  '77': 'Odisha',
  '78': 'Assam',
  '79': 'North East (NE)',
  '80': 'Bihar',
  '81': 'Bihar',
  '82': 'Jharkhand',
  '83': 'Jharkhand',
  '84': 'Bihar',
  '85': 'Bihar'
};

export function validatePincode(pincode: string): PincodeValidationResult {
  const clean = pincode ? pincode.replace(/\D/g, '') : '';
  if (!clean) {
    return { isValid: false, message: 'Delivery PIN code is required.' };
  }
  if (clean.length !== 6) {
    return { isValid: false, message: `PIN code must be exactly 6 digits (${clean.length}/6 entered).` };
  }
  if (!INDIAN_PINCODE_REGEX.test(clean)) {
    return { isValid: false, message: 'Invalid PIN code. Indian postal codes cannot start with 0.' };
  }
  const prefix = clean.substring(0, 2);
  const detectedState = PINCODE_PREFIX_MAP[prefix];
  return { isValid: true, detectedState };
}

export function validateFullName(name: string): ValidationResult {
  const trimmed = name ? name.trim() : '';
  if (!trimmed) {
    return { isValid: false, message: 'Full name is required.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, message: 'Full name must be at least 2 characters.' };
  }
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
    return { isValid: false, message: 'Please enter a valid name using letters only.' };
  }
  return { isValid: true };
}

export interface PasswordValidationResult extends ValidationResult {
  strength: 'weak' | 'medium' | 'strong';
  score: number; // 0 to 4
}

export function validatePassword(password: string): PasswordValidationResult {
  if (!password) {
    return { isValid: false, message: 'Password is required.', strength: 'weak', score: 0 };
  }
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long.', strength: 'weak', score: 1 };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 3) {
    strength = 'strong';
  } else if (score >= 2) {
    strength = 'medium';
  }

  return { isValid: true, strength, score };
}

export function validateStreetAddress(address: string): ValidationResult {
  const trimmed = address ? address.trim() : '';
  if (!trimmed) {
    return { isValid: false, message: 'Street address is required for courier delivery.' };
  }
  if (trimmed.length < 6) {
    return { isValid: false, message: 'Please provide full house/flat no., building and street name.' };
  }
  return { isValid: true };
}

export function validateCity(city: string): ValidationResult {
  const trimmed = city ? city.trim() : '';
  if (!trimmed) {
    return { isValid: false, message: 'City is required.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, message: 'Please enter a valid city name.' };
  }
  return { isValid: true };
}

export function validateGstin(gstin: string): ValidationResult {
  const clean = gstin ? gstin.trim().toUpperCase() : '';
  if (!clean) {
    return { isValid: false, message: 'GSTIN is required.' };
  }
  if (!GSTIN_REGEX.test(clean)) {
    return { isValid: false, message: 'Please enter a valid 15-character GSTIN (e.g. 07AAECP4108K1Z5).' };
  }
  return { isValid: true };
}

export function validatePrice(price: number | string): ValidationResult {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num) || num <= 0) {
    return { isValid: false, message: 'Price must be greater than ₹0.' };
  }
  return { isValid: true };
}

export function validateStock(stock: number | string): ValidationResult {
  const num = typeof stock === 'string' ? parseInt(stock, 10) : stock;
  if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
    return { isValid: false, message: 'Stock must be a non-negative whole number (0, 1, 2...).' };
  }
  return { isValid: true };
}

export function validateTrackingQuery(query: string): {
  isValid: boolean;
  type: 'orderId' | 'phone' | 'invalid';
  cleanValue: string;
  message?: string;
} {
  const trimmed = query ? query.trim() : '';
  if (!trimmed) {
    return { isValid: false, type: 'invalid', cleanValue: '', message: 'Please enter an Order ID or 10-digit mobile number.' };
  }

  // Check for 10-digit phone number
  const cleanPhone = trimmed.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    return { isValid: true, type: 'phone', cleanValue: cleanPhone };
  }

  // Check for Order ID pattern (e.g. ORD-1001, ord-1002, 1001)
  const orderMatch = trimmed.toUpperCase().replace(/\s+/g, '');
  if (orderMatch.startsWith('ORD-') || orderMatch.startsWith('ORD') || /^\d{4,6}$/.test(orderMatch)) {
    const cleanId = orderMatch.startsWith('ORD-') ? orderMatch : orderMatch.startsWith('ORD') ? `ORD-${orderMatch.substring(3)}` : `ORD-${orderMatch}`;
    return { isValid: true, type: 'orderId', cleanValue: cleanId };
  }

  return {
    isValid: false,
    type: 'invalid',
    cleanValue: trimmed,
    message: 'Invalid search format. Enter Order ID (e.g. ORD-1001) or 10-digit mobile number.'
  };
}

export function validateIssueClaim(orderId: string, description: string, phone: string): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!orderId || !orderId.trim()) {
    errors.orderId = 'Please enter or select the Order ID (e.g. PYN-1001).';
  } else if (!/^[A-Za-z0-9-_]{3,20}$/.test(orderId.trim())) {
    errors.orderId = 'Please enter a valid Order ID format (letters, numbers, hyphens).';
  }

  const phoneRes = validatePhone(phone);
  if (!phoneRes.isValid) {
    errors.phone = phoneRes.message || 'Valid 10-digit mobile number is required.';
  }

  if (!description || description.trim().length < 10) {
    errors.description = 'Please describe the issue in at least 10 characters (e.g. damaged spine, missing pages).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateUpiId(upi: string): ValidationResult {
  const trimmed = upi ? upi.trim() : '';
  if (!trimmed) {
    return { isValid: false, message: 'UPI ID is required for Instant UPI payment.' };
  }
  // UPI ID format: username@bankname
  const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  if (!UPI_REGEX.test(trimmed)) {
    return { isValid: false, message: 'Please enter a valid UPI ID (e.g. name@okaxis, user@upi).' };
  }
  return { isValid: true };
}

export function validateReview(name: string, comment: string, rating: number): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  if (!name || name.trim().length < 2) {
    errors.name = 'Your name must be at least 2 characters.';
  }
  if (!comment || comment.trim().length < 8) {
    errors.comment = 'Review feedback must be at least 8 characters long.';
  }
  if (!rating || rating < 1 || rating > 5) {
    errors.rating = 'Please select a star rating between 1 and 5.';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateProductForm(title: string, regularPrice: number, salePrice: number, stock: number, sku?: string): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  if (!title || title.trim().length < 3) {
    errors.title = 'Product title must be at least 3 characters.';
  }
  if (regularPrice <= 0 || isNaN(regularPrice)) {
    errors.regularPrice = 'MRP regular price must be greater than ₹0.';
  }
  if (salePrice <= 0 || isNaN(salePrice)) {
    errors.salePrice = 'Sale price must be greater than ₹0.';
  }
  if (regularPrice < salePrice) {
    errors.regularPrice = 'MRP regular price cannot be less than sale price.';
  }
  if (stock < 0 || !Number.isInteger(stock) || isNaN(stock)) {
    errors.stock = 'Stock must be 0 or a positive whole integer.';
  }
  if (sku !== undefined && (!sku.trim() || sku.trim().length < 2)) {
    errors.sku = 'SKU identifier must be at least 2 characters.';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateStoreSettings(storeName: string, supportEmail: string, supportPhone?: string): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  if (!storeName || storeName.trim().length < 2) {
    errors.storeName = 'Store name must be at least 2 characters.';
  }
  if (supportEmail) {
    const emailRes = validateEmail(supportEmail);
    if (!emailRes.isValid) {
      errors.supportEmail = emailRes.message || 'Invalid support email address.';
    }
  }
  if (supportPhone) {
    const phoneRes = validatePhone(supportPhone);
    if (!phoneRes.isValid) {
      errors.supportPhone = phoneRes.message || 'Invalid 10-digit support phone number.';
    }
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
