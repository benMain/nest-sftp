import { DynamicModule, FactoryProvider, ValueProvider } from '@nestjs/common';
import { ConnectConfig } from 'ssh2';

export interface ImportableFactoryProvider<T>
  extends Omit<FactoryProvider<T>, 'provide'>,
    Pick<DynamicModule, 'imports'> {}

export type AsyncProvider<T> =
  | ImportableFactoryProvider<T>
  | Omit<ValueProvider<T>, 'provide'>;

export type ConnectConfigExt = ConnectConfig & {
  delayConnection?: boolean;
};
