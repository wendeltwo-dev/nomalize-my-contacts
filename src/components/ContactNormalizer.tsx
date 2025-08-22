import React, { useState } from 'react';
import { Upload, Download, Copy, FileText, Users, Settings, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from './FileUpload';
import { EditableTable } from './EditableTable';
import { NormalizationConfig } from './NormalizationConfig';
import { ContactTable } from './ContactTable';
import { exportToCSV, copyToClipboard } from '@/lib/exportUtils';
import { normalizeContacts, Contact, NormalizationRules } from '@/lib/contactNormalizer';

export const ContactNormalizer = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [normalizedContacts, setNormalizedContacts] = useState<Contact[]>([]);
  const [rules, setRules] = useState<NormalizationRules>({
    phoneFormat: '+55 (XX) XXXXX-XXXX',
    removeAccents: false,
    upperCase: false,
    lowerCase: false,
    capitalize: true,
    combineNames: true,
    preferPrimaryPhone: true,
    includeAllPhones: true,
    includeEmails: true,
    includeAddress: true,
    includeOrganization: true
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleContactsLoad = (loadedContacts: Contact[]) => {
    setContacts(loadedContacts);
    setNormalizedContacts([]);
  };

  const handleNormalize = async () => {
    if (contacts.length === 0) {
      toast({
        title: "Nenhum contato para processar",
        description: "Adicione contatos antes de normalizar.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // UX delay
      const normalized = normalizeContacts(contacts, rules);
      setNormalizedContacts(normalized);
      
      toast({
        title: "Normalização concluída!",
        description: `${normalized.length} contatos normalizados com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro na normalização",
        description: "Ocorreu um erro ao processar os contatos.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = () => {
    if (normalizedContacts.length === 0) {
      toast({
        title: "Nenhum contato normalizado",
        description: "Normalize os contatos antes de exportar.",
        variant: "destructive"
      });
      return;
    }

    exportToCSV(normalizedContacts, 'contatos-normalizados.csv');
    toast({
      title: "Arquivo exportado!",
      description: "Os contatos foram exportados com sucesso.",
    });
  };

  const handleCopy = async () => {
    if (normalizedContacts.length === 0) {
      toast({
        title: "Nenhum contato normalizado",
        description: "Normalize os contatos antes de copiar.",
        variant: "destructive"
      });
      return;
    }

    const success = await copyToClipboard(normalizedContacts);
    if (success) {
      toast({
        title: "Copiado para área de transferência!",
        description: "Os contatos estão prontos para serem colados.",
      });
    } else {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar os contatos.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface-elevated">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Normalizador de Contatos</h1>
              <p className="text-muted-foreground">Padronize seus contatos de forma rápida e segura</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Step 1: Data Input */}
          <Card className="saas-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">1</div>
                <CardTitle className="text-lg">Entrada de Dados</CardTitle>
              </div>
              <CardDescription>
                Importe seus contatos ou digite manualmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="text-xs">
                    <Upload className="w-4 h-4 mr-1" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="text-xs">
                    <FileText className="w-4 h-4 mr-1" />
                    Manual
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="mt-4">
                  <FileUpload onContactsLoad={handleContactsLoad} />
                </TabsContent>
                <TabsContent value="manual" className="mt-4">
                  <EditableTable onContactsLoad={handleContactsLoad} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Step 2: Configuration */}
          <Card className="saas-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">2</div>
                <CardTitle className="text-lg">Configurações</CardTitle>
              </div>
              <CardDescription>
                Defina as regras de normalização
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NormalizationConfig rules={rules} onRulesChange={setRules} />
              
              <div className="mt-6 pt-4 border-t border-border">
                <Button 
                  onClick={handleNormalize}
                  disabled={isProcessing || contacts.length === 0}
                  className="w-full saas-button-primary"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Normalizar Contatos
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Export */}
          <Card className="saas-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">3</div>
                <CardTitle className="text-lg">Exportar Dados</CardTitle>
              </div>
              <CardDescription>
                Baixe ou copie os contatos normalizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {normalizedContacts.length > 0 && (
                <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {normalizedContacts.length} contatos normalizados
                    </span>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Button 
                  onClick={handleExport}
                  disabled={normalizedContacts.length === 0}
                  className="w-full saas-button-secondary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV/Excel
                </Button>
                
                <Button 
                  onClick={handleCopy}
                  disabled={normalizedContacts.length === 0}
                  variant="outline"
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Todos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        {contacts.length > 0 && (
          <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="saas-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Contatos Originais
                </CardTitle>
                <CardDescription>
                  {contacts.length} contatos carregados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactTable contacts={contacts} />
              </CardContent>
            </Card>

            {normalizedContacts.length > 0 && (
              <Card className="saas-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    Contatos Normalizados
                  </CardTitle>
                  <CardDescription>
                    {normalizedContacts.length} contatos processados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ContactTable contacts={normalizedContacts} />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};