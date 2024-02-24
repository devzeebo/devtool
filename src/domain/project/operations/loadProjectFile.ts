import { readTextFile } from '@tauri-apps/plugin-fs';
import json5 from 'json5';
import { dirname } from '@tauri-apps/api/path';
import type { Project } from '../models/Project';

export const loadProjectFile = async (path: string) => {
  const cwd = await dirname(path);

  const raw = json5.parse<Project>(
    await readTextFile(path),
  );

  console.log(raw.workingDirectory, cwd);

  raw.workingDirectory = raw.workingDirectory ?? cwd;

  return raw;
};
