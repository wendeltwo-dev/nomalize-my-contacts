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
      <div className="max-h-96 overflow-y-auto">
        <table className="saas-table">
          <thead className="sticky top-0 bg-muted">
            <tr>
              <th className="text-left py-2 px-3 text-xs font-medium">#</th>
              <th className="text-left py-2 px-3 text-xs font-medium">Nome</th>
              <th className="text-left py-2 px-3 text-xs font-medium">Telefone</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact, index) => (
              <tr key={index} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                <td className="py-2 px-3 text-xs text-muted-foreground">{index + 1}</td>
                <td className="py-2 px-3 text-xs font-medium">{contact.name || '-'}</td>
                <td className="py-2 px-3 text-xs font-mono">{contact.phone || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {contacts.length > 10 && (
        <div className="bg-muted/30 px-3 py-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Mostrando {Math.min(10, contacts.length)} de {contacts.length} contatos
          </p>
        </div>
      )}
    </div>
  );
};