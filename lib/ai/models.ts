// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'gemma3:1b',
    label: 'gemma3-1b',
    apiIdentifier: 'gemma3:1b',
    description: 'Daha küçük ve hızlı bir model',
  },
  {
    id: 'gemma3:4b',
    label: 'gemma3-4b',
    apiIdentifier: 'gemma3:4b',
    description: 'Orta boyutlu bir model',
  },
  {
    id: 'gemma3:12b',
    label: 'gemma3-12b',
    apiIdentifier: 'gemma3:12b',
    description: 'Daha büyük ve daha güçlü bir model',
  },
] as const;

export const DEFAULT_MODEL_NAME: string = 'gemma3:1b';
