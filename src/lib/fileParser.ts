import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Contact } from './contactNormalizer';

// Enhanced CSV parser with better field detection
const parseCSV = (file: File): Promise<Contact[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      transformHeader: (header: string) => {
        return header.trim();
      },
      complete: (results) => {
        try {
          console.log('CSV parsing results:', results);
          console.log('Headers found:', results.meta.fields);
          
          const contacts: Contact[] = [];
          
          results.data.forEach((row: any, index: number) => {
            const contact = extractContactFromRow(row);
            if (contact.name || contact.phone) {
              contacts.push(contact);
            }
          });

          console.log(`Extracted ${contacts.length} contacts from CSV`);
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
  });
};

// Smart contact extraction from row data
const extractContactFromRow = (row: any): Contact => {
  const keys = Object.keys(row);
  let name = '';
  let phone = '';
  
  console.log('Processing row:', row);
  
  // Try to find name field
  for (const key of keys) {
    const lowerKey = key.toLowerCase().trim();
    const value = (row[key] || '').toString().trim();
    
    // Name field patterns
    if (!name && value && (
      lowerKey.includes('name') ||
      lowerKey.includes('nome') ||
      lowerKey.includes('given name') ||
      lowerKey.includes('first name') ||
      lowerKey.includes('family name') ||
      lowerKey.includes('last name') ||
      lowerKey === 'name' ||
      lowerKey === 'nome' ||
      lowerKey === 'full name' ||
      lowerKey === 'nome completo' ||
      lowerKey === 'contact name' ||
      lowerKey === 'display name'
    )) {
      name = value;
      continue;
    }
    
    // Phone field patterns
    if (!phone && value && (
      lowerKey.includes('phone') ||
      lowerKey.includes('telefone') ||
      lowerKey.includes('fone') ||
      lowerKey.includes('mobile') ||
      lowerKey.includes('cel') ||
      lowerKey.includes('celular') ||
      lowerKey.includes('number') ||
      lowerKey.includes('numero') ||
      lowerKey === 'phone' ||
      lowerKey === 'telefone' ||
      lowerKey === 'mobile phone' ||
      lowerKey === 'cell phone' ||
      lowerKey === 'phone 1 - value' ||
      lowerKey === 'phone 2 - value' ||
      lowerKey === 'primary phone' ||
      lowerKey === 'home phone' ||
      lowerKey === 'work phone'
    )) {
      phone = value;
      continue;
    }
  }
  
  // If name not found in typical fields, try to combine first and last name
  if (!name) {
    const firstName = findValueByPattern(row, ['given name', 'first name', 'primeiro nome', 'nome']);
    const lastName = findValueByPattern(row, ['family name', 'last name', 'sobrenome', 'surname']);
    const middleName = findValueByPattern(row, ['middle name', 'nome do meio']);
    
    if (firstName || lastName) {
      name = [firstName, middleName, lastName].filter(Boolean).join(' ').trim();
    }
  }
  
  // If still no name, try any field that looks like a name (non-empty, non-phone-like)
  if (!name) {
    for (const key of keys) {
      const value = (row[key] || '').toString().trim();
      if (value && !isPhoneNumber(value) && !isEmail(value) && value.length > 1) {
        name = value;
        break;
      }
    }
  }
  
  // If no phone found, try any field that looks like a phone number
  if (!phone) {
    for (const key of keys) {
      const value = (row[key] || '').toString().trim();
      if (value && isPhoneNumber(value)) {
        phone = value;
        break;
      }
    }
  }
  
  console.log(`Extracted - Name: "${name}", Phone: "${phone}"`);
  
  return { name, phone };
};

// Helper to find value by field patterns
const findValueByPattern = (row: any, patterns: string[]): string => {
  for (const key of Object.keys(row)) {
    const lowerKey = key.toLowerCase().trim();
    for (const pattern of patterns) {
      if (lowerKey.includes(pattern.toLowerCase()) || lowerKey === pattern.toLowerCase()) {
        const value = (row[key] || '').toString().trim();
        if (value) return value;
      }
    }
  }
  return '';
};

// Check if a value looks like a phone number
const isPhoneNumber = (value: string): boolean => {
  const cleanValue = value.replace(/\D/g, '');
  return cleanValue.length >= 8 && cleanValue.length <= 15 && /\d/.test(value);
};

// Check if a value looks like an email
const isEmail = (value: string): boolean => {
  return /@/.test(value) && value.includes('.');
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
        console.log('Excel data:', jsonData);
        
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
          
          const contact = extractContactFromRow(rowObject);
          if (contact.name || contact.phone) {
            contacts.push(contact);
          }
        }
        
        console.log(`Extracted ${contacts.length} contacts from Excel`);
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