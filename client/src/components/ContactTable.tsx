import React from 'react';
import { Contact } from '@/lib/contactNormalizer';

interface ContactTableProps {
  contacts: Contact[];
}

export const ContactTable: React.FC<ContactTableProps> = ({ contacts }) => {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhum contato para exibir</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="max-h-96 overflow-y-auto overflow-x-auto">
        <table className="w-full border-collapse min-w-full">
          <thead className="sticky top-0 bg-muted">
            <tr>
              <th className="text-left py-2 px-3 text-xs font-medium min-w-8">#</th>
              <th className="text-left py-2 px-3 text-xs font-medium min-w-32">Nome Completo</th>
              <th className="text-left py-2 px-3 text-xs font-medium min-w-32">Telefone Principal</th>
              <th className="text-left py-2 px-3 text-xs font-medium min-w-32">Email</th>
              <th className="text-left py-2 px-3 text-xs font-medium min-w-32">Empresa</th>
              <th className="text-left py-2 px-3 text-xs font-medium min-w-24">Telefones</th>
              <th className="text-left py-2 px-3 text-xs font-medium min-w-32">Endereço</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact, index) => {
              // Combine name parts
              const fullName = [
                contact.namePrefix,
                contact.firstName,
                contact.middleName,
                contact.lastName,
                contact.nameSuffix
              ].filter(part => part).join(' ').trim() || contact.name || '-';
              
              const primaryPhone = contact.phone1Value || contact.phone || '-';
              const primaryEmail = contact.email1Value || '-';
              const organization = contact.organizationName || '-';
              
              // Count additional phones
              const additionalPhones = [
                contact.phone2Value,
                contact.phone3Value,
                contact.phone4Value
              ].filter(phone => phone).length;
              
              const address = contact.address1Formatted || 
                [contact.address1Street, contact.address1City, contact.address1Region]
                  .filter(part => part).join(', ') || '-';
              
              return (
                <tr key={index} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                  <td className="py-2 px-3 text-xs text-muted-foreground">{index + 1}</td>
                  <td className="py-2 px-3 text-xs font-medium" title={fullName}>
                    <div className="max-w-32 truncate">{fullName}</div>
                  </td>
                  <td className="py-2 px-3 text-xs font-mono" title={primaryPhone}>
                    <div className="max-w-32 truncate">{primaryPhone}</div>
                  </td>
                  <td className="py-2 px-3 text-xs" title={primaryEmail}>
                    <div className="max-w-32 truncate">{primaryEmail}</div>
                  </td>
                  <td className="py-2 px-3 text-xs" title={organization}>
                    <div className="max-w-32 truncate">{organization}</div>
                  </td>
                  <td className="py-2 px-3 text-xs text-muted-foreground">
                    {additionalPhones > 0 ? `+${additionalPhones}` : '-'}
                  </td>
                  <td className="py-2 px-3 text-xs" title={address}>
                    <div className="max-w-32 truncate">{address}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {contacts.length > 10 && (
        <div className="bg-muted/30 px-3 py-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Mostrando todos os {contacts.length} contatos com campos completos
          </p>
        </div>
      )}
    </div>
  );
};