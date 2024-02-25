import { isString } from 'lodash/fp';
import { useCallback, useContext, useMemo } from 'react';
import type { ProjectCommand } from '../../domain/project/models/Command';
import type { Project } from '../../domain/project/models/Project';
import type { CommandHook } from './Context';
import Context from './Context';

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

  const start = useCallback(
    () => dispatch({ kind: 'start', path }),
    [dispatch, path],
  );

  return useMemo(
    (): CommandHook => ({
      start,
      stop,
      tauriCmd: cmd?.cmd,
      ...(cmd?.pid
        ? {
          pid: cmd.pid,
          state: 'started',
        }
        : {
          state: 'stopped',
          exitCode: cmd?.exitCode ?? null,
        }),
      logFile: cmd?.logLocation,
    }),
    [cmd, start, stop],
  );
};
