import {
  useState,
  type PropsWithChildren,
  useCallback,
  useMemo,
} from 'react';
import JSON5 from 'json5';
import { readTextFile } from '@tauri-apps/plugin-fs';
import type { Project } from '../../domain/project/models/Project';
import Context from './Context';

export type ProjectProviderProps = PropsWithChildren<{}>;

const ProjectProvider = ({
  children,
}: ProjectProviderProps) => {
  const [project, setProject] = useState<Project | null>(null);

  const loadProject = useCallback(
    async () => {
      setProject(
        JSON5.parse<Project>(
          await readTextFile('/home/devzeebo/git/personal/devtool/example/example-project.devtool'),
        ),
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      project,
      loadProject,
    }),
    [loadProject, project],
  );

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};

export default ProjectProvider;
