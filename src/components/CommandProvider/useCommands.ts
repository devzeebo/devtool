import {
  filter, flow, isString, map, startsWith, toPairs,
} from 'lodash/fp';
import { useCallback, useContext, useMemo } from 'react';
import type { Project } from '../../domain/project/models/Project';
import type { CommandCache, CommandHook } from './Context';
import Context from './Context';

export const useCommands = (
  project: string | Project,
): CommandHook[] => {
  const projectPath = isString(project) ? project : project.name;

  const {
    commands,
    dispatch,
  } = useContext(Context);

  const cmds = useMemo(
    () => flow(
      toPairs,
      filter(([path]) => startsWith(projectPath, path)),
      map(([path, cmd]) => [`${path}:${cmd.type}`, cmd]),
    )(commands),
    [commands, projectPath],
  );

  const stop = useCallback(
    (path: string) => dispatch({ kind: 'stop', path }),
    [dispatch],
  );

  const start = useCallback(
    (path: string) => dispatch({ kind: 'start', path }),
    [dispatch],
  );

  return useMemo(
    () => map(
      ([path, cmd]: [string, CommandCache]): CommandHook => ({
        start: () => start(path),
        stop: () => stop(path),
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
      cmds,
    ) as any as CommandHook[],
    [cmds, start, stop],
  );
};
