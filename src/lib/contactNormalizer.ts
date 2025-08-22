export interface Contact {
  name: string;
  phone: string;
}

export interface NormalizationRules {
  phoneFormat: string;
  removeAccents: boolean;
  upperCase: boolean;
  lowerCase: boolean;
  capitalize: boolean;
}

// Remove accents from text
const removeAccents = (text: string): string => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

// Capitalize words (Title Case)
const capitalizeWords = (text: string): string => {
  return text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

// Format name according to rules
const formatName = (name: string, rules: NormalizationRules): string => {
  if (!name) return '';
  
  let formatted = name.trim();
  
  // Remove accents
  if (rules.removeAccents) {
    formatted = removeAccents(formatted);
  }
  
  // Apply case transformations
  if (rules.upperCase) {
    formatted = formatted.toUpperCase();
  } else if (rules.lowerCase) {
    formatted = formatted.toLowerCase();
  } else if (rules.capitalize) {
    formatted = capitalizeWords(formatted);
  }
  
  return formatted;
};

// Extract only digits from phone
const extractDigits = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

// Format phone according to pattern
const formatPhone = (phone: string, format: string): string => {
  if (!phone) return '';
  
  const digits = extractDigits(phone);
  
  // Handle different Brazilian phone number patterns
  let cleanDigits = digits;
  
  // Remove country code if present (55)
  if (cleanDigits.startsWith('55') && cleanDigits.length >= 11) {
    cleanDigits = cleanDigits.substring(2);
  }
  
  // Remove leading zero from area code if present
  if (cleanDigits.startsWith('0') && cleanDigits.length >= 10) {
    cleanDigits = cleanDigits.substring(1);
  }
  
  // Ensure we have at least 10 digits for a valid Brazilian phone
  if (cleanDigits.length < 10) {
    return phone; // Return original if invalid
  }
  
  // Pad with leading zeros if needed (for area codes)
  if (cleanDigits.length === 10) {
    cleanDigits = cleanDigits; // landline
  } else if (cleanDigits.length === 11) {
    cleanDigits = cleanDigits; // mobile
  }
  
  // Apply formatting based on selected pattern
  switch (format) {
    case '+55 (XX) XXXXX-XXXX':
      if (cleanDigits.length === 11) {
        return `+55 (${cleanDigits.substring(0, 2)}) ${cleanDigits.substring(2, 7)}-${cleanDigits.substring(7)}`;
      } else if (cleanDigits.length === 10) {
        return `+55 (${cleanDigits.substring(0, 2)}) ${cleanDigits.substring(2, 6)}-${cleanDigits.substring(6)}`;
      }
      break;
      
    case 'XXXXXXXXXXX':
      return cleanDigits;
      
    case '+55 XX XXXXX XXXX':
      if (cleanDigits.length === 11) {
        return `+55 ${cleanDigits.substring(0, 2)} ${cleanDigits.substring(2, 7)} ${cleanDigits.substring(7)}`;
      } else if (cleanDigits.length === 10) {
        return `+55 ${cleanDigits.substring(0, 2)} ${cleanDigits.substring(2, 6)} ${cleanDigits.substring(6)}`;
      }
      break;
      
    case '(XX) XXXXX-XXXX':
      if (cleanDigits.length === 11) {
        return `(${cleanDigits.substring(0, 2)}) ${cleanDigits.substring(2, 7)}-${cleanDigits.substring(7)}`;
      } else if (cleanDigits.length === 10) {
        return `(${cleanDigits.substring(0, 2)}) ${cleanDigits.substring(2, 6)}-${cleanDigits.substring(6)}`;
      }
      break;
      
    case 'XX XXXXX-XXXX':
      if (cleanDigits.length === 11) {
        return `${cleanDigits.substring(0, 2)} ${cleanDigits.substring(2, 7)}-${cleanDigits.substring(7)}`;
      } else if (cleanDigits.length === 10) {
        return `${cleanDigits.substring(0, 2)} ${cleanDigits.substring(2, 6)}-${cleanDigits.substring(6)}`;
      }
      break;
      
    case 'XXXXXXXXXXX':
      return cleanDigits;
      
    default:
      return phone;
  }
  
  return phone; // fallback
};

// Main normalization function
export const normalizeContacts = (contacts: Contact[], rules: NormalizationRules): Contact[] => {
  return contacts.map(contact => ({
    name: formatName(contact.name, rules),
    phone: formatPhone(contact.phone, rules.phoneFormat)
  }));
};