import { setupServer } from 'msw/node';

import { amapHandlers } from './amap_api_handlers';
import { griffinHandlers } from './griffin_api_handlers';

export const server = setupServer(...griffinHandlers, ...amapHandlers);
