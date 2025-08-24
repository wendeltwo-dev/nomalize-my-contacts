import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Contact } from './contactNormalizer';

// Google Contacts CSV field mapping
const GOOGLE_CONTACTS_FIELDS = {
  'First Name': 'firstName',
  'Middle Name': 'middleName',
  'Last Name': 'lastName',
  'Phonetic First Name': 'phoneticFirstName',
  'Phonetic Middle Name': 'phoneticMiddleName',
  'Phonetic Last Name': 'phoneticLastName',
  'Name Prefix': 'namePrefix',
  'Name Suffix': 'nameSuffix',
  'Nickname': 'nickname',
  'File As': 'fileAs',
  'Organization Name': 'organizationName',
  'Organization Title': 'organizationTitle',
  'Organization Department': 'organizationDepartment',
  'Birthday': 'birthday',
  'Notes': 'notes',
  'Photo': 'photo',
  'Labels': 'labels',
  'E-mail 1 - Label': 'email1Label',
  'E-mail 1 - Value': 'email1Value',
  'E-mail 2 - Label': 'email2Label',
  'E-mail 2 - Value': 'email2Value',
  'Phone 1 - Label': 'phone1Label',
  'Phone 1 - Value': 'phone1Value',
  'Phone 2 - Label': 'phone2Label',
  'Phone 2 - Value': 'phone2Value',
  'Phone 3 - Label': 'phone3Label',
  'Phone 3 - Value': 'phone3Value',
  'Phone 4 - Label': 'phone4Label',
  'Phone 4 - Value': 'phone4Value',
  'Address 1 - Label': 'address1Label',
  'Address 1 - Formatted': 'address1Formatted',
  'Address 1 - Street': 'address1Street',
  'Address 1 - City': 'address1City',
  'Address 1 - PO Box': 'address1POBox',
  'Address 1 - Region': 'address1Region',
  'Address 1 - Postal Code': 'address1PostalCode',
  'Address 1 - Country': 'address1Country',
  'Address 1 - Extended Address': 'address1ExtendedAddress',
  'Website 1 - Label': 'website1Label',
  'Website 1 - Value': 'website1Value'
};

// Create empty contact with all fields
const createEmptyContact = (): Contact => ({
  firstName: '',
  middleName: '',
  lastName: '',
  phoneticFirstName: '',
  phoneticMiddleName: '',
  phoneticLastName: '',
  namePrefix: '',
  nameSuffix: '',
  nickname: '',
  fileAs: '',
  organizationName: '',
  organizationTitle: '',
  organizationDepartment: '',
  birthday: '',
  notes: '',
  photo: '',
  labels: '',
  email1Label: '',
  email1Value: '',
  email2Label: '',
  email2Value: '',
  phone1Label: '',
  phone1Value: '',
  phone2Label: '',
  phone2Value: '',
  phone3Label: '',
  phone3Value: '',
  phone4Label: '',
  phone4Value: '',
  address1Label: '',
  address1Formatted: '',
  address1Street: '',
  address1City: '',
  address1POBox: '',
  address1Region: '',
  address1PostalCode: '',
  address1Country: '',
  address1ExtendedAddress: '',
  website1Label: '',
  website1Value: ''
});

// Enhanced CSV parser with proper UTF-8 handling
const parseCSV = (file: File): Promise<Contact[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            try {
              console.log('CSV parsing results:', results);
              console.log('Headers found:', results.meta.fields);
              console.log('First few rows:', results.data.slice(0, 3));
              
              const contacts: Contact[] = [];
              
              results.data.forEach((row: any, index: number) => {
                const contact = mapRowToContact(row);
                
                // Check if contact has any meaningful data
                if (hasValidData(contact)) {
                  contacts.push(contact);
                }
              });

              console.log(`Successfully extracted ${contacts.length} contacts from CSV`);
              console.log('Sample contacts:', contacts.slice(0, 2));
              
              resolve(contacts);
            } catch (error) {
              console.error('Error processing CSV data:', error);
              reject(new Error('Erro ao processar dados do CSV'));
            }
          },
          error: (error) => {
            console.error('Papa Parse error:', error);
            reject(new Error(`Erro ao ler CSV: ${error.message}`));
          }
        });
      } catch (error) {
        console.error('Error reading file:', error);
        reject(new Error('Erro ao ler arquivo CSV'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo CSV'));
    };
    
    // Read file as text with UTF-8 encoding
    reader.readAsText(file, 'UTF-8');
  });
};

// Map CSV row to Contact object
const mapRowToContact = (row: any): Contact => {
  const contact = createEmptyContact();
  
  Object.keys(row).forEach(key => {
    const trimmedKey = key.trim();
    const value = (row[key] || '').toString().trim();
    
    // Direct mapping for Google Contacts format
    if (GOOGLE_CONTACTS_FIELDS[trimmedKey as keyof typeof GOOGLE_CONTACTS_FIELDS]) {
      const fieldName = GOOGLE_CONTACTS_FIELDS[trimmedKey as keyof typeof GOOGLE_CONTACTS_FIELDS] as keyof Contact;
      (contact[fieldName] as string) = value;
    }
    // Fallback for other formats
    else {
      mapAlternativeFields(contact, trimmedKey, value);
    }
  });
  
  // Create legacy fields for backward compatibility
  contact.name = [contact.namePrefix, contact.firstName, contact.middleName, contact.lastName, contact.nameSuffix]
    .filter(part => part)
    .join(' ')
    .trim();
    
  contact.phone = contact.phone1Value || contact.phone2Value || contact.phone3Value || contact.phone4Value || '';
  
  return contact;
};

// Map alternative field names to contact fields
const mapAlternativeFields = (contact: Contact, key: string, value: string) => {
  const lowerKey = key.toLowerCase();
  
  // Name variations
  if (lowerKey.includes('first') && lowerKey.includes('name') && !contact.firstName) {
    contact.firstName = value;
  } else if (lowerKey.includes('last') && lowerKey.includes('name') && !contact.lastName) {
    contact.lastName = value;
  } else if (lowerKey.includes('middle') && lowerKey.includes('name') && !contact.middleName) {
    contact.middleName = value;
  } else if ((lowerKey === 'name' || lowerKey === 'nome') && !contact.firstName) {
    // If it's a simple "name" field, put it in firstName
    contact.firstName = value;
  }
  
  // Phone variations
  else if (lowerKey.includes('phone') || lowerKey.includes('telefone') || lowerKey.includes('fone')) {
    if (!contact.phone1Value) {
      contact.phone1Value = value;
      contact.phone1Label = 'Mobile';
    } else if (!contact.phone2Value) {
      contact.phone2Value = value;
      contact.phone2Label = 'Other';
    }
  }
  
  // Email variations
  else if (lowerKey.includes('email') || lowerKey.includes('e-mail')) {
    if (!contact.email1Value) {
      contact.email1Value = value;
      contact.email1Label = 'Personal';
    } else if (!contact.email2Value) {
      contact.email2Value = value;
      contact.email2Label = 'Work';
    }
  }
  
  // Organization variations
  else if (lowerKey.includes('company') || lowerKey.includes('organization') || lowerKey.includes('empresa')) {
    contact.organizationName = value;
  }
};

// Check if contact has any valid data
const hasValidData = (contact: Contact): boolean => {
  return !!(
    contact.firstName ||
    contact.lastName ||
    contact.phone1Value ||
    contact.phone2Value ||
    contact.email1Value ||
    contact.organizationName ||
    contact.name
  );
};

// Enhanced Excel parser
const parseExcel = (file: File): Promise<Contact[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        console.log('Reading Excel file...');
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log('Excel data preview:', jsonData.slice(0, 3));
        
        if (jsonData.length < 1) {
          reject(new Error('Arquivo Excel vazio'));
          return;
        }
        
        // Convert to object format for consistent processing
        const headers = (jsonData[0] as string[]).map(h => (h || '').toString().trim());
        console.log('Excel headers:', headers);
        
        const contacts: Contact[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          const rowObject: any = {};
          
          headers.forEach((header, index) => {
            if (header && row[index] !== undefined) {
              rowObject[header] = row[index];
            }
          });
          
          const contact = mapRowToContact(rowObject);
          if (hasValidData(contact)) {
            contacts.push(contact);
          }
        }
        
        console.log(`Successfully extracted ${contacts.length} contacts from Excel`);
        resolve(contacts);
      } catch (error) {
        console.error('Excel parsing error:', error);
        reject(new Error('Erro ao processar arquivo Excel'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Main parser function
export const parseFile = async (file: File): Promise<Contact[]> => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. Máximo permitido: 10MB');
  }
  
  console.log(`Parsing file: ${file.name} (${file.size} bytes)`);
  
  const extension = file.name.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'csv':
      return parseCSV(file);
    case 'xlsx':
    case 'xls':
      return parseExcel(file);
    default:
      throw new Error('Formato de arquivo não suportado');
  }
};