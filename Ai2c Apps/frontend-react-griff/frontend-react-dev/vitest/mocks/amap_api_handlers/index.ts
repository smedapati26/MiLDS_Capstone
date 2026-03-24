import { personnelHandlers } from './personnel/handlers';
import { amapUserHandlers } from './users/handlers';

export const amapHandlers = [...amapUserHandlers, ...personnelHandlers];
