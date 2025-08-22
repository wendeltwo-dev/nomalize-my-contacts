import { Contact } from './contactNormalizer';

// Export contacts to CSV
export const exportToCSV = (contacts: Contact[], filename: string = 'contatos.csv') => {
  const csvContent = [
    'Nome,Telefone', // Header
    ...contacts.map(contact => `"${contact.name}","${contact.phone}"`)
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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

// Copy contacts to clipboard
export const copyToClipboard = async (contacts: Contact[]): Promise<boolean> => {
  try {
    const text = contacts
      .map(contact => `${contact.name}\t${contact.phone}`)
      .join('\n');
    
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