
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { ragTools } from './tools';

export const mastra = new Mastra({
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
  tools: ragTools,
});
