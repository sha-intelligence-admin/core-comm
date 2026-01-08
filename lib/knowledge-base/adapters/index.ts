/**
 * This file serves as the entry point to register all adapters.
 * It's imported by the service to ensure registry is populated.
 */

import { registerAdapter } from '../registry';
import { QdrantAdapter } from './byok/qdrant';
import { NativeManagedAdapter } from './managed/native';

// Register supported adapters
registerAdapter('qdrant', QdrantAdapter);
registerAdapter('native', NativeManagedAdapter);
