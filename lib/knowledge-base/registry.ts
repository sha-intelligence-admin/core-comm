import { IKbAdapter, KbProvider } from './types';

const adapters: Partial<Record<KbProvider, new () => IKbAdapter>> = {};

export function registerAdapter(provider: KbProvider, adapterClass: new () => IKbAdapter) {
  adapters[provider] = adapterClass;
}

export function getAdapter(provider: KbProvider): IKbAdapter {
  const AdapterClass = adapters[provider];
  if (!AdapterClass) {
    throw new Error(`No adapter registered for provider: ${provider}`);
  }
  return new AdapterClass();
}
