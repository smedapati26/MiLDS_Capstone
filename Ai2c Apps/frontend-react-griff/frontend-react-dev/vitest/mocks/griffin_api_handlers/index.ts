import { agseHandlers } from './agse/agseHandlers';
import { aircraftHandlers } from './aircraft/aircraftHandlers';
import { autoDsrHandlers } from './auto_dsr/autoDsrHandlers';
import { componentsHandlers } from './components/componentsHandlers';
import { equipmentManagerHandlers } from './equipment/handler';
import { lanesHandlers } from './events/lanesHandlers';
import { maintenanceHandlers } from './events/maintenanceHandlers';
import { faultOverTimeHandlers } from './faults/handlers';
import { inspectionsHandlers } from './inspections/handlers';
import { modsHandlers } from './mods/modsHandlers';
import { personnelHandlers } from './personnel/handlers';
import { hoursFlownHandlers } from './readiness/hoursFlownHandlers';
import { missionsFlownHandlers } from './readiness/missionsFlownHandlers';
import { statusOverTimeHandlers } from './readiness/statusOverTimeHandlers';
import { reportsHandlers } from './reports/reportsHandlers';
import { taskforceHandlers } from './taskforce/taskforceHandlers';
import { uacHandlers } from './uas/uacHandlers';
import { uavHandlers } from './uas/uavHandlers';
import { griffinUserHandlers as userHandlers } from './users/handlers';

export const griffinHandlers = [
  ...agseHandlers,
  ...aircraftHandlers,
  ...autoDsrHandlers,
  ...componentsHandlers,
  ...equipmentManagerHandlers,
  ...faultOverTimeHandlers,
  ...hoursFlownHandlers,
  ...inspectionsHandlers,
  ...lanesHandlers,
  ...maintenanceHandlers,
  ...missionsFlownHandlers,
  ...modsHandlers,
  ...personnelHandlers,
  ...reportsHandlers,
  ...statusOverTimeHandlers,
  ...taskforceHandlers,
  ...uacHandlers,
  ...uavHandlers,
  ...userHandlers,
];
