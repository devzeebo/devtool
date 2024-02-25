import {
  createContext,
} from 'react';
import { constant } from 'lodash/fp';
import type { Command as TauriCommand, TerminatedPayload } from '@tauri-apps/plugin-shell';
import type { FileHandle } from '@tauri-apps/plugin-fs';

type StartedInfo = {
  state: 'started',
  pid: number,
};
type StoppedInfo = {
  state: 'stopped',
  exitCode: number | null;
};
export type CommandHook = {
  start: () => Promise<any>,
  stop: () => void,
  tauriCmd: Pick<TauriCommand<any>, 'on' | 'stdout' | 'stderr'>
  logFile: string,
} & (
  StartedInfo
  | StoppedInfo
);

type StopCommandFn = (ReturnType<TauriCommand<any>['spawn']> extends Promise<infer T>
  ? T
  : never
)['kill'];

export type CommandCache = {
  hash: string,
  cmd: TauriCommand<any>,
  pid: number | null,
  exitCode: number | null,
  logFile: FileHandle,
  logLocation: string,
  start: TauriCommand<any>['spawn'],
  stop: StopCommandFn,
};

export type CommandCacheMap = Record<
string,
CommandCache
>;

type StartAction = {
  kind: 'start',
  path: string,
};
type StopAction = {
  kind: 'stop',
  path: string,
  terminated?: TerminatedPayload,
};
type SetAction = {
  kind: 'set',
  path: string,
  cmd: CommandCache,
};
export type Action = StartAction | StopAction | SetAction;
export type Dispatch = (action: Action) => Promise<void>;

export type CommandContextType = {
  commands: CommandCacheMap,
  dispatch: Dispatch,
};

const Context = createContext<CommandContextType>({
  commands: {},
  dispatch: constant(Promise.resolve()),
});
export default Context;
