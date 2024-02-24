import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef,
} from 'react';
import { constant, isString, noop } from 'lodash/fp';
import type { Command as TauriCommand, TerminatedPayload } from '@tauri-apps/plugin-shell';
import type { ProjectCommand } from '../../domain/project/models/Command';
import type { Project } from '../../domain/project/models/Project';

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

export const useCommand = (
  project: string | Project,
  type: ProjectCommand['type'],
): CommandHook => {
  const projectPath = isString(project) ? project : project.name;
  const path = `${projectPath}:${type}`;

  const {
    commands,
    dispatch,
  } = useContext(Context);

  const cmd = commands[path]!;

  const stop = useCallback(
    () => dispatch({ kind: 'stop', path }),
    [dispatch, path],
  );

  const hashRef = useRef<string>('');

  const start = useCallback(
    () => dispatch({ kind: 'start', path }),
    [dispatch, path],
  );

  useEffect(
    () => {
      if (hashRef.current === cmd?.hash) {
        return noop;
      }

      hashRef.current = cmd?.hash;

      return async () => {
        await stop();
      };
    },
    [cmd?.hash, stop],
  );

  return useMemo(
    () => ({
      start,
      stop,
      ...(cmd?.pid
        ? {
          pid: cmd.pid,
          state: 'started',
        }
        : {
          state: 'stopped',
          exitCode: cmd?.exitCode ?? null,
        }),
    }),
    [cmd, start, stop],
  );
};
