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
  toPairs,
} from 'lodash/fp';
import { Command as TauriCommand } from '@tauri-apps/plugin-shell';
import { mapAsync, withKey } from 'moredash';
import type {
  Action, CommandCache, CommandCacheMap, Dispatch,
} from './Context';
import Context from './Context';
import type { Project } from '../../domain/project/models/Project';
import type { Command } from '../../domain/project/models/Command';
import { useProject } from '../ProjectProvider';

export type CommandProviderProps = PropsWithChildren<{}>;

const hashCommand = (
  path: string,
  command: Command,
) => `${path}:${JSON.stringify(command)}`;

const buildCommand = (
  path: string,
  cmd: Command,
): CommandCache => {
  const cmdBits = castArray(cmd.command);

  const tauriCmd = TauriCommand.create(
    cmdBits[0],
    drop(1, cmdBits),
    { cwd: '../example/server' },
  );

  tauriCmd.on('error', console.error);
  tauriCmd.stdout.on('data', console.log);
  tauriCmd.stderr.on('data', console.warn);

  console.log({ tauriCmd });

  return {
    hash: hashCommand(path, cmd),
    cmd: tauriCmd,
    pid: null,
    exitCode: null,
    start: () => tauriCmd.spawn(),
    stop: constant(Promise.resolve()),
  };
};

type NewCommandList = Record<string, CommandCache>;
const getCommandList = (
  projects: Project[],
): NewCommandList => (
  flow(
    map((p: Project) => flow(
      keyBy((c: Command) => `${p.name}:${c.type}`),
      toPairs,
    )(p.commands)),
    flatten,
    fromPairs,
    withKey(mapValues)((
      c: Command,
      path: string,
    ) => buildCommand(path, c)),
  )(projects) as any
);

const reducer = async (current: CommandCacheMap, action: Action) => {
  const newMap = {
    ...current,
  };

  switch (action.kind) {
    case 'start': {
      const newCmd = { ...current[action.path]! };
      const child = await newCmd.start();
      newCmd.pid = child.pid;
      newCmd.stop = child.kill;
      newMap[action.path] = newCmd;
      return newMap;
    }
    case 'stop': {
      const newCmd = { ...current[action.path]! };
      await newCmd.stop();
      newCmd.exitCode = action.terminated?.code ?? 0;
      newCmd.pid = null;
      newCmd.stop = constant(Promise.resolve());
      newMap[action.path] = newCmd;
      return newMap;
    }
    case 'set': {
      const existing = current[action.path];
      if (existing?.hash !== action.cmd.hash) {
        if (existing) {
          await existing.stop();
        }
        newMap[action.path] = action.cmd;
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
        cmdRef.cmd.on('close', (terminated) => dispatch({ kind: 'stop', path: action.path, terminated }));
      }

      commandsRef.current = await reducer(commandsRef.current, action);
      setCommands(commandsRef.current);
    },
    [],
  );

  useEffect(
    () => {
      const newCommands = getCommandList(rootProject?.projects ?? []);

      (async () => {
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
    [dispatch, rootProject?.projects],
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
