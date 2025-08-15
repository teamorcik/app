// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'Orcik23/orcik:1b',
    label: 'orcik-1b',
    apiIdentifier: 'Orcik23/orcik:1b',
    description: 'Daha küçük ve hızlı bir model',
  },
  {
    id: 'Orcik23/orcik:4b',
    label: 'orcik-4b',
    apiIdentifier: 'Orcik23/orcik:4b',
    description: 'Orta boyutlu bir model',
  },
  {
    id: 'Orcik23/orcik:12b',
    label: 'orcik-12b',
    apiIdentifier: 'Orcik23/orcik:12b',
    description: 'Daha büyük ve daha güçlü bir model',
  },
] as const;

export const DEFAULT_MODEL_NAME: string = 'Orcik23/orcik:4b';
