import React from 'react';
import { Phone, Type } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { NormalizationRules } from '@/lib/contactNormalizer';

interface NormalizationConfigProps {
  rules: NormalizationRules;
  onRulesChange: (rules: NormalizationRules) => void;
}

export const NormalizationConfig: React.FC<NormalizationConfigProps> = ({ rules, onRulesChange }) => {
  const phoneFormats = [
    { label: '+55 (31) 99999-9999', value: '+55 (XX) XXXXX-XXXX' },
    { label: '031999999999', value: 'XXXXXXXXXXX' },
    { label: '+55 31 99999 9999', value: '+55 XX XXXXX XXXX' },
    { label: '(31) 99999-9999', value: '(XX) XXXXX-XXXX' },
    { label: '31 99999-9999', value: 'XX XXXXX-XXXX' },
    { label: '31999999999', value: 'XXXXXXXXXXX' }
  ];

  const updateRules = (key: keyof NormalizationRules, value: any) => {
    onRulesChange({ ...rules, [key]: value });
  };

  const handleNameFormatChange = (key: keyof NormalizationRules, checked: boolean) => {
    // Handle mutually exclusive name formatting options
    if (checked && (key === 'upperCase' || key === 'lowerCase' || key === 'capitalize')) {
      const newRules = { ...rules };
      newRules.upperCase = false;
      newRules.lowerCase = false;
      newRules.capitalize = false;
      newRules[key] = true;
      onRulesChange(newRules);
    } else {
      updateRules(key, checked);
    }
  };

  return (
    <div className="space-y-6">
      {/* Phone Format */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary" />
          <Label className="text-sm font-medium">Formato do Telefone</Label>
        </div>
        <Select
          value={rules.phoneFormat}
          onValueChange={(value) => updateRules('phoneFormat', value)}
        >
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Selecione o formato" />
          </SelectTrigger>
          <SelectContent className="bg-surface-elevated border border-border">
            {phoneFormats.map((format) => (
              <SelectItem key={format.value} value={format.value} className="text-sm">
                {format.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Name Formatting */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-primary" />
          <Label className="text-sm font-medium">Formatação de Nomes</Label>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="removeAccents"
              checked={rules.removeAccents}
              onCheckedChange={(checked) => updateRules('removeAccents', checked)}
            />
            <Label htmlFor="removeAccents" className="text-sm text-foreground cursor-pointer">
              Remover acentos (João → Joao)
            </Label>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="upperCase"
                checked={rules.upperCase}
                onCheckedChange={(checked) => handleNameFormatChange('upperCase', !!checked)}
              />
              <Label htmlFor="upperCase" className="text-sm text-foreground cursor-pointer">
                MAIÚSCULAS (João → JOÃO)
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowerCase"
                checked={rules.lowerCase}
                onCheckedChange={(checked) => handleNameFormatChange('lowerCase', !!checked)}
              />
              <Label htmlFor="lowerCase" className="text-sm text-foreground cursor-pointer">
                minúsculas (João → joão)
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="capitalize"
                checked={rules.capitalize}
                onCheckedChange={(checked) => handleNameFormatChange('capitalize', !!checked)}
              />
              <Label htmlFor="capitalize" className="text-sm text-foreground cursor-pointer">
                Capitalizar (joão silva → João Silva)
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-muted/30 rounded-lg p-3 border border-border">
        <Label className="text-xs font-medium text-muted-foreground mb-2 block">Exemplo:</Label>
        <div className="space-y-1">
          <div className="text-xs text-foreground">
            <span className="text-muted-foreground">Nome:</span> "joão da silva" → "João Da Silva"
          </div>
          <div className="text-xs text-foreground">
            <span className="text-muted-foreground">Telefone:</span> "31987654321" → "+55 (31) 98765-4321"
          </div>
        </div>
      </div>
    </div>
  );
};