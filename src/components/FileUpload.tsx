import React, { useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { parseFile } from '@/lib/fileParser';
import { Contact } from '@/lib/contactNormalizer';

interface FileUploadProps {
  onContactsLoad: (contacts: Contact[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onContactsLoad }) => {
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().split('.').pop();
    if (!fileExtension || !validExtensions.includes(`.${fileExtension}`)) {
      toast({
        title: "Formato de arquivo inválido",
        description: "Por favor, use arquivos .csv ou .xlsx",
        variant: "destructive"
      });
      event.target.value = '';
      return;
    }

    try {
      const contacts = await parseFile(file);
      
      if (contacts.length === 0) {
        toast({
          title: "Arquivo vazio",
          description: "O arquivo não contém dados válidos.",
          variant: "destructive"
        });
        return;
      }

      onContactsLoad(contacts);
      toast({
        title: "Arquivo carregado com sucesso!",
        description: `${contacts.length} contatos encontrados.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao processar arquivo",
        description: "Verifique se o arquivo está no formato correto.",
        variant: "destructive"
      });
    }
    
    // Reset input
    event.target.value = '';
  }, [onContactsLoad, toast]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      // Create a fake event to reuse the same logic
      const fakeEvent = {
        target: { files: [file], value: '' }
      } as any;
      handleFileUpload(fakeEvent);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-6 text-center transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
          <FileSpreadsheet className="w-6 h-6 text-muted-foreground" />
        </div>
        
        <div className="mb-4">
          <p className="text-sm font-medium text-foreground mb-1">
            Arraste um arquivo aqui ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground">
            Suporte para .csv e .xlsx (máx. 10MB)
          </p>
        </div>

        <label htmlFor="file-upload">
          <Button variant="outline" className="cursor-pointer" asChild>
            <span>
              <Upload className="w-4 h-4 mr-2" />
              Selecionar Arquivo
            </span>
          </Button>
        </label>
        
        <input
          id="file-upload"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <div className="bg-muted/30 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Formato esperado:</p>
            <p>• Primeira linha: cabeçalhos (Nome, Telefone)</p>
            <p>• Dados nas linhas seguintes</p>
            <p>• Máximo de 10.000 contatos</p>
          </div>
        </div>
      </div>
    </div>
  );
};