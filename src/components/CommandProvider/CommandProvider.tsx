import {
  useMemo,
  type PropsWithChildren,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  castArray,
  constant,
  drop,
  flatten,
  flow,
  fromPairs,
  keyBy,
  map,
  mapValues,
  tap,
  toPairs,
} from 'lodash/fp';
import { Command as TauriCommand } from '@tauri-apps/plugin-shell';
import { mapAsync } from 'moredash';
import { resolve, appLocalDataDir } from '@tauri-apps/api/path';
import type { FileHandle } from '@tauri-apps/plugin-fs';
import { mkdir, open } from '@tauri-apps/plugin-fs';
import type {
  Action, CommandCache, CommandCacheMap, Dispatch,
} from './Context';
import Context from './Context';
import type { Project } from '../../domain/project/models/Project';
import type { ProjectCommand } from '../../domain/project/models/Command';
import { useProject } from '../ProjectProvider';

export type CommandProviderProps = PropsWithChildren<{}>;

const utf8 = new TextEncoder();
const createLogger = (file: FileHandle) => (line: string) => {
  file.write(utf8.encode(line));
};

const stopLogging = async (
  command: CommandCache,
) => {
  if (command) {
    await command.logFile.close();
  }
};

const initializeLogFile = async (
  path: string,
  command: CommandCache,
) => {
  const logLocation = await resolve(await appLocalDataDir(), 'command-logs');
  const logFileName = await resolve(logLocation, `${path}.log`);
  await mkdir(logLocation, { recursive: true });
  const logFile = await open(
    logFileName,
    { append: true, create: true },
  );

  command.cmd.on('error', createLogger(logFile));
  command.cmd.stdout.on('data', createLogger(logFile));
  command.cmd.stderr.on('data', createLogger(logFile));

  // eslint-disable-next-line no-param-reassign -- internal use
  command.logLocation = logFileName;
};

const hashCommand = (
  path: string,
  command: ProjectCommand,
) => `${path}:${JSON.stringify(command)}`;

const buildCommand = async (
  path: string,
  cwd: string,
  cmd: ProjectCommand,
): Promise<CommandCache> => {
  const cmdBits = castArray(cmd.command);

  const tauriCmd = TauriCommand.create(
    cmdBits[0],
    drop(1, cmdBits),
    { cwd: await resolve(cwd, cmd.workingDirectory ?? '.') },
  );

  return {
    hash: hashCommand(path, cmd),
    cmd: tauriCmd,
    pid: null,
    exitCode: null,
    logFile: null!,
    logLocation: '',
    start: () => tauriCmd.spawn(),
    stop: constant(Promise.resolve()),
  };
};

type NewCommandList = Record<string, CommandCache>;
const getCommandList = async (
  cwd: string,
  projects: Project[],
): Promise<NewCommandList> => {
  const allCommands = (
    flow(
      map((p: Project) => flow(
        keyBy((c: ProjectCommand) => `${p.name}:${c.type}`),
        tap(console.log),
        mapValues((c: ProjectCommand) => ({
          ...c,
          workingDirectory: c.workingDirectory ?? p.workingDirectory ?? '.',
        })),
        tap(console.log),
        toPairs,
      )(p.commands)),
      flatten,
    )(projects) as any
  );

  const compiledCommands = await mapAsync(
    async ([path, c]: [string, ProjectCommand]): Promise<[string, CommandCache]> => [
      path,
      await buildCommand(path, cwd, c),
    ],
    allCommands,
  );

  return fromPairs(compiledCommands);
};

const reducer = async (current: CommandCacheMap, action: Action) => {
  const newMap = {
    ...current,
  };

  switch (action.kind) {
    case 'start': {
      console.trace('start', { action });
      const newCmd = { ...current[action.path]! };
      const child = await newCmd.start();
      newCmd.pid = child.pid;
      newCmd.stop = child.kill;
      newMap[action.path] = newCmd;
      return newMap;
    }
    case 'stop': {
      console.trace('stop', { action });
      const newCmd = { ...current[action.path]! };
      await newCmd.stop();
      newCmd.exitCode = action.terminated?.code ?? 0;
      newCmd.pid = null;
      newCmd.stop = constant(Promise.resolve());
      newMap[action.path] = newCmd;
      return newMap;
    }
    case 'set': {
      console.trace('set', { action });
      const existing = current[action.path];
      if (existing?.hash !== action.cmd.hash) {
        await stopLogging(existing);
        if (existing?.stop) {
          console.trace('stopping command');
          await existing.stop();
        }
        newMap[action.path] = action.cmd;
        await initializeLogFile(action.path, newMap[action.path]);

        return newMap;
      }
      return current;
    }
    default:
      throw new Error(`unsupported action: ${JSON.stringify(action)}`);
  }
};

const CommandProvider = ({
  children,
}: CommandProviderProps) => {
  const { project: rootProject } = useProject();

  const commandsRef = useRef<CommandCacheMap>({});
  const [commands, setCommands] = useState<CommandCacheMap>({});

  const dispatch: Dispatch = useCallback(
    async (action: Action) => {
      const cmdRef = commandsRef.current[action.path];

      if (cmdRef?.cmd && action.kind === 'start') {
        cmdRef.cmd.removeAllListeners('close');
        cmdRef.cmd.on('close', (terminated) => {
          console.trace('stopping because closed', { terminated });
          dispatch({ kind: 'stop', path: action.path, terminated });
        });
      }

      commandsRef.current = await reducer(commandsRef.current, action);
      setCommands(commandsRef.current);
    },
    [],
  );

  useEffect(
    () => {
      if (!rootProject?.projects) {
        return;
      }

      (async () => {
        const newCommands = await getCommandList(
          rootProject.workingDirectory,
          rootProject.projects,
        );

        const pairs = toPairs(newCommands);
        await mapAsync(
          ([path, cmd]) => dispatch({
            kind: 'set',
            path,
            cmd,
          }),
          pairs,
        );
      })();
    },
    [dispatch, rootProject?.workingDirectory, rootProject?.projects],
  );

  const value = useMemo(
    () => ({
      commands,
      dispatch,
    }),
    [commands, dispatch],
  );

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};

export default CommandProvider;
