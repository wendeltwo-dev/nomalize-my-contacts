export interface Contact {
  // Name fields
  firstName: string;
  middleName: string;
  lastName: string;
  phoneticFirstName: string;
  phoneticMiddleName: string;
  phoneticLastName: string;
  namePrefix: string;
  nameSuffix: string;
  nickname: string;
  fileAs: string;
  
  // Organization
  organizationName: string;
  organizationTitle: string;
  organizationDepartment: string;
  
  // Personal info
  birthday: string;
  notes: string;
  photo: string;
  labels: string;
  
  // Emails
  email1Label: string;
  email1Value: string;
  email2Label: string;
  email2Value: string;
  
  // Phones
  phone1Label: string;
  phone1Value: string;
  phone2Label: string;
  phone2Value: string;
  phone3Label: string;
  phone3Value: string;
  phone4Label: string;
  phone4Value: string;
  
  // Address
  address1Label: string;
  address1Formatted: string;
  address1Street: string;
  address1City: string;
  address1POBox: string;
  address1Region: string;
  address1PostalCode: string;
  address1Country: string;
  address1ExtendedAddress: string;
  
  // Website
  website1Label: string;
  website1Value: string;
  
  // Legacy fields for backward compatibility
  name?: string;
  phone?: string;
}

export interface NormalizationRules {
  phoneFormat: string;
  removeAccents: boolean;
  upperCase: boolean;
  lowerCase: boolean;
  capitalize: boolean;
  
  // New options for handling multiple fields
  combineNames: boolean;
  preferPrimaryPhone: boolean;
  includeAllPhones: boolean;
  includeEmails: boolean;
  includeAddress: boolean;
  includeOrganization: boolean;
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
  
  // Apply formatting based on selected pattern
  switch (format) {
    case '+55 (XX) XXXXX-XXXX':
      if (cleanDigits.length === 11) {
        return `+55 (${cleanDigits.substring(0, 2)}) ${cleanDigits.substring(2, 7)}-${cleanDigits.substring(7)}`;
      } else if (cleanDigits.length === 10) {
        return `+55 (${cleanDigits.substring(0, 2)}) ${cleanDigits.substring(2, 6)}-${cleanDigits.substring(6)}`;
      }
      break;
      
    case 'XXXXXXXXXX':
      return cleanDigits.length >= 10 ? cleanDigits.substring(0, 10) : cleanDigits;
      
    case 'XXXXXXXXXXX':
      return cleanDigits;
      
    case 'XXX X XXXX XXXX':
      if (cleanDigits.length === 11) {
        return `0${cleanDigits.substring(0, 2)} ${cleanDigits.substring(2, 3)} ${cleanDigits.substring(3, 7)} ${cleanDigits.substring(7)}`;
      } else if (cleanDigits.length === 10) {
        return `0${cleanDigits.substring(0, 2)} ${cleanDigits.substring(2, 6)} ${cleanDigits.substring(6)}`;
      }
      break;
      
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
      
    default:
      return phone;
  }
  
  return phone; // fallback
};

// Combine name parts into full name
const combineNameParts = (contact: Contact, rules: NormalizationRules): string => {
  const parts = [
    contact.namePrefix,
    contact.firstName,
    contact.middleName,
    contact.lastName,
    contact.nameSuffix
  ].filter(part => part && part.trim());
  
  return formatName(parts.join(' '), rules);
};

// Get primary phone number
const getPrimaryPhone = (contact: Contact, rules: NormalizationRules): string => {
  const phones = [
    contact.phone1Value,
    contact.phone2Value,
    contact.phone3Value,
    contact.phone4Value
  ].filter(phone => phone && phone.trim());
  
  return phones.length > 0 ? formatPhone(phones[0], rules.phoneFormat) : '';
};

// Get all phone numbers formatted
const getAllPhones = (contact: Contact, rules: NormalizationRules): string[] => {
  const phones = [
    contact.phone1Value,
    contact.phone2Value,
    contact.phone3Value,
    contact.phone4Value
  ].filter(phone => phone && phone.trim());
  
  return phones.map(phone => formatPhone(phone, rules.phoneFormat));
};

// Main normalization function
export const normalizeContacts = (contacts: Contact[], rules: NormalizationRules): Contact[] => {
  return contacts.map(contact => {
    const normalized: Contact = { ...contact };
    
    // Format individual name parts
    normalized.firstName = formatName(contact.firstName, rules);
    normalized.middleName = formatName(contact.middleName, rules);
    normalized.lastName = formatName(contact.lastName, rules);
    normalized.nickname = formatName(contact.nickname, rules);
    normalized.namePrefix = formatName(contact.namePrefix, rules);
    normalized.nameSuffix = formatName(contact.nameSuffix, rules);
    
    // Format organization
    normalized.organizationName = formatName(contact.organizationName, rules);
    normalized.organizationTitle = formatName(contact.organizationTitle, rules);
    normalized.organizationDepartment = formatName(contact.organizationDepartment, rules);
    
    // Format phones
    normalized.phone1Value = formatPhone(contact.phone1Value, rules.phoneFormat);
    normalized.phone2Value = formatPhone(contact.phone2Value, rules.phoneFormat);
    normalized.phone3Value = formatPhone(contact.phone3Value, rules.phoneFormat);
    normalized.phone4Value = formatPhone(contact.phone4Value, rules.phoneFormat);
    
    // Legacy compatibility
    if (rules.combineNames) {
      normalized.name = combineNameParts(contact, rules);
    }
    if (rules.preferPrimaryPhone) {
      normalized.phone = getPrimaryPhone(contact, rules);
    }
    
    return normalized;
  });
};