import { createContext, useContext } from 'react';
import { constant } from 'lodash/fp';
import type { Project } from '../../domain/project/models/Project';

type ProjectContextType = {
  project: Project | null,
  loadProject: (path: string) => Promise<any>,
};

const Context = createContext<ProjectContextType>({
  project: null,
  loadProject: constant(Promise.reject()),
});
export default Context;

export const useProject = () => useContext(Context);
