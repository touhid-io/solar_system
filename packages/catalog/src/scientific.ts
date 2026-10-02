import catalogData from '../../../data/catalog/solar-system.v1.json';
import sourceData from '../../../data/manifests/sources.v1.json';
import assetData from '../../../data/manifests/assets.v1.json';
import { validateScientificBundle } from './validation';
/** Validated clone per call; callers cannot mutate the checked-in dataset singleton. */
export function loadStarterScientificBundle(){return validateScientificBundle(catalogData,sourceData,assetData);}
