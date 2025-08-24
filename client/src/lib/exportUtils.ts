import { Contact } from './contactNormalizer';

// Export contacts to CSV with all fields
export const exportToCSV = (contacts: Contact[], filename: string = 'contatos-normalizados.csv') => {
  // Define all headers in the order they appear in Google Contacts
  const headers = [
    'First Name',
    'Middle Name', 
    'Last Name',
    'Phonetic First Name',
    'Phonetic Middle Name',
    'Phonetic Last Name',
    'Name Prefix',
    'Name Suffix',
    'Nickname',
    'File As',
    'Organization Name',
    'Organization Title',
    'Organization Department',
    'Birthday',
    'Notes',
    'Photo',
    'Labels',
    'E-mail 1 - Label',
    'E-mail 1 - Value',
    'E-mail 2 - Label',
    'E-mail 2 - Value',
    'Phone 1 - Label',
    'Phone 1 - Value',
    'Phone 2 - Label',
    'Phone 2 - Value',
    'Phone 3 - Label',
    'Phone 3 - Value',
    'Phone 4 - Label',
    'Phone 4 - Value',
    'Address 1 - Label',
    'Address 1 - Formatted',
    'Address 1 - Street',
    'Address 1 - City',
    'Address 1 - PO Box',
    'Address 1 - Region',
    'Address 1 - Postal Code',
    'Address 1 - Country',
    'Address 1 - Extended Address',
    'Website 1 - Label',
    'Website 1 - Value'
  ];
  
  // Create CSV content
  const csvRows = [
    headers.join(','), // Header row
    ...contacts.map(contact => {
      const values = [
        contact.firstName || '',
        contact.middleName || '',
        contact.lastName || '',
        contact.phoneticFirstName || '',
        contact.phoneticMiddleName || '',
        contact.phoneticLastName || '',
        contact.namePrefix || '',
        contact.nameSuffix || '',
        contact.nickname || '',
        contact.fileAs || '',
        contact.organizationName || '',
        contact.organizationTitle || '',
        contact.organizationDepartment || '',
        contact.birthday || '',
        contact.notes || '',
        contact.photo || '',
        contact.labels || '',
        contact.email1Label || '',
        contact.email1Value || '',
        contact.email2Label || '',
        contact.email2Value || '',
        contact.phone1Label || '',
        contact.phone1Value || '',
        contact.phone2Label || '',
        contact.phone2Value || '',
        contact.phone3Label || '',
        contact.phone3Value || '',
        contact.phone4Label || '',
        contact.phone4Value || '',
        contact.address1Label || '',
        contact.address1Formatted || '',
        contact.address1Street || '',
        contact.address1City || '',
        contact.address1POBox || '',
        contact.address1Region || '',
        contact.address1PostalCode || '',
        contact.address1Country || '',
        contact.address1ExtendedAddress || '',
        contact.website1Label || '',
        contact.website1Value || ''
      ];
      
      // Escape values and wrap in quotes
      return values.map(value => `"${(value || '').toString().replace(/"/g, '""')}"`).join(',');
    })
  ];
  
  const csvContent = csvRows.join('\n');
  
  // Create and download file with UTF-8 BOM for proper encoding
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Copy contacts to clipboard (simplified format)
export const copyToClipboard = async (contacts: Contact[]): Promise<boolean> => {
  try {
    // Create a simplified tab-separated format for easy pasting
    const text = [
      'Nome\tTelefone\tEmail\tEmpresa', // Header
      ...contacts.map(contact => {
        const fullName = [contact.namePrefix, contact.firstName, contact.middleName, contact.lastName, contact.nameSuffix]
          .filter(part => part)
          .join(' ')
          .trim() || contact.name || '';
        
        const primaryPhone = contact.phone1Value || contact.phone || '';
        const primaryEmail = contact.email1Value || '';
        const organization = contact.organizationName || '';
        
        return `${fullName}\t${primaryPhone}\t${primaryEmail}\t${organization}`;
      })
    ].join('\n');
    
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or non-HTTPS
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};