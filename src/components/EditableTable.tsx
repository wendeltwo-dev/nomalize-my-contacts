import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Contact } from '@/lib/contactNormalizer';

interface EditableTableProps {
  onContactsLoad: (contacts: Contact[]) => void;
}

// Simple contact interface for the editable table
interface SimpleContact {
  name: string;
  phone: string;
}

// Create a full Contact from simple data
const createFullContact = (simple: SimpleContact): Contact => ({
  firstName: simple.name,
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
  phone1Label: 'Mobile',
  phone1Value: simple.phone,
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
  website1Value: '',
  name: simple.name,
  phone: simple.phone
});

export const EditableTable: React.FC<EditableTableProps> = ({ onContactsLoad }) => {
  const [contacts, setContacts] = useState<SimpleContact[]>([
    { name: '', phone: '' },
    { name: '', phone: '' },
    { name: '', phone: '' }
  ]);

  const updateContact = useCallback((index: number, field: keyof SimpleContact, value: string) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setContacts(newContacts);
  }, [contacts]);

  const addRow = useCallback(() => {
    setContacts([...contacts, { name: '', phone: '' }]);
  }, [contacts]);

  const removeRow = useCallback((index: number) => {
    if (contacts.length > 1) {
      const newContacts = contacts.filter((_, i) => i !== index);
      setContacts(newContacts);
    }
  }, [contacts]);

  const loadContacts = useCallback(() => {
    const validContacts = contacts.filter(contact => 
      contact.name.trim() !== '' || contact.phone.trim() !== ''
    );
    
    if (validContacts.length === 0) {
      return;
    }

    // Convert simple contacts to full Contact format
    const fullContacts = validContacts.map(createFullContact);
    onContactsLoad(fullContacts);
  }, [contacts, onContactsLoad]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const lines = pastedText.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length > 1) {
      const newContacts = lines.map(line => {
        const parts = line.split(/\t|,|;/).map(part => part.trim());
        return {
          name: parts[0] || '',
          phone: parts[1] || ''
        };
      });
      
      setContacts(newContacts);
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <div className="bg-muted px-3 py-2 border-b border-border">
          <div className="grid grid-cols-2 gap-4 text-xs font-medium text-muted-foreground">
            <div>Nome</div>
            <div>Telefone</div>
          </div>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {contacts.map((contact, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 p-3 border-b border-border last:border-b-0 group hover:bg-muted/30">
              <Input
                value={contact.name}
                onChange={(e) => updateContact(index, 'name', e.target.value)}
                onPaste={handlePaste}
                placeholder="Nome do contato"
                className="text-sm h-8"
              />
              <div className="flex gap-2">
                <Input
                  value={contact.phone}
                  onChange={(e) => updateContact(index, 'phone', e.target.value)}
                  placeholder="Telefone"
                  className="text-sm h-8"
                />
                {contacts.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRow(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={addRow}
          className="flex-1"
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar Linha
        </Button>
        
        <Button
          onClick={loadContacts}
          size="sm"
          className="flex-1 saas-button-primary"
          disabled={!contacts.some(c => c.name.trim() || c.phone.trim())}
        >
          <Users className="w-4 h-4 mr-1" />
          Carregar Contatos
        </Button>
      </div>

      <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
        <p className="font-medium mb-1">💡 Dica:</p>
        <p>Cole dados de planilhas (Ctrl+V) diretamente na primeira célula para preenchimento automático.</p>
      </div>
    </div>
  );
};