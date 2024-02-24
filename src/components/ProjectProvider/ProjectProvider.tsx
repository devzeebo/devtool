import {
  useState,
  type PropsWithChildren,
  useCallback,
  useMemo,
} from 'react';
import type { Project } from '../../domain/project/models/Project';
import Context from './Context';
import { loadProjectFile } from '../../domain/project/operations/loadProjectFile';

export type ProjectProviderProps = PropsWithChildren<{}>;

const ProjectProvider = ({
  children,
}: ProjectProviderProps) => {
  const [project, setProject] = useState<Project | null>(null);

  const loadProject = useCallback(
    async () => {
      setProject(
        await loadProjectFile('/home/devzeebo/git/personal/devtool/example/example-project.devtool'),
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
