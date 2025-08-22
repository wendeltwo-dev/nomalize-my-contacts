import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Contact } from './contactNormalizer';

// Parse CSV file
const parseCSV = (file: File): Promise<Contact[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        // Normalize header names
        const normalizedHeader = header.toLowerCase().trim();
        if (normalizedHeader.includes('nome') || normalizedHeader.includes('name')) {
          return 'name';
        }
        if (normalizedHeader.includes('telefone') || normalizedHeader.includes('phone') || normalizedHeader.includes('fone')) {
          return 'phone';
        }
        return header;
      },
      complete: (results) => {
        try {
          const contacts: Contact[] = results.data
            .map((row: any) => ({
              name: (row.name || row.nome || row.Name || row.Nome || '').toString().trim(),
              phone: (row.phone || row.telefone || row.Phone || row.Telefone || row.fone || '').toString().trim()
            }))
            .filter((contact: Contact) => contact.name || contact.phone);

          resolve(contacts);
        } catch (error) {
          reject(new Error('Erro ao processar dados do CSV'));
        }
      },
      error: (error) => {
        reject(new Error(`Erro ao ler CSV: ${error.message}`));
      }
    });
  });
};

// Parse Excel file
const parseExcel = (file: File): Promise<Contact[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          reject(new Error('Arquivo deve conter pelo menos uma linha de cabeçalho e uma linha de dados'));
          return;
        }
        
        // Get headers
        const headers = (jsonData[0] as string[]).map(h => h.toLowerCase().trim());
        
        // Find name and phone columns
        let nameIndex = -1;
        let phoneIndex = -1;
        
        headers.forEach((header, index) => {
          if (header.includes('nome') || header.includes('name')) {
            nameIndex = index;
          }
          if (header.includes('telefone') || header.includes('phone') || header.includes('fone')) {
            phoneIndex = index;
          }
        });
        
        // If exact matches not found, use first two columns
        if (nameIndex === -1) nameIndex = 0;
        if (phoneIndex === -1) phoneIndex = 1;
        
        // Parse data rows
        const contacts: Contact[] = jsonData
          .slice(1) // Skip header
          .map((row: any) => ({
            name: (row[nameIndex] || '').toString().trim(),
            phone: (row[phoneIndex] || '').toString().trim()
          }))
          .filter((contact: Contact) => contact.name || contact.phone);
        
        resolve(contacts);
      } catch (error) {
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