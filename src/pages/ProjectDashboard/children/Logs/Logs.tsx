import { useOutletContext } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  Unstable_Grid2 as Grid,
  Paper,
} from '@mui/material';
import {
  dropLast,
  flow,
  last,
  map,
  noop,
  size,
  split,
} from 'lodash/fp';
import { withKey } from 'moredash';
import type { FileHandle } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-fs';
import { useCommand } from '../../../../components/CommandProvider';
import type { ProjectDashboardContext } from '../../ProjectDashboard';

type LogLine = [
  number,
  string,
];

const utf8 = new TextDecoder();

const ProjectDashboardLogs = () => {
  const { project } = useOutletContext<ProjectDashboardContext>();

  const startCmd = useCommand(project, 'start');

  const scrollMarker = useRef<HTMLDivElement>(null);

  const [logs, setLogs] = useState<LogLine[]>([]);
  const [, setLogBuffer] = useState('');

  const [logHandle, setLogHandle] = useState<FileHandle | null>(null);
  useEffect(
    () => {
      let handle: FileHandle | null = null;

      (async () => {
        handle = await open(startCmd.logFile);

        setLogHandle(handle);
      })();

      return () => {
        if (handle) {
          handle.close();
        }
      };
    },
    [startCmd?.logFile],
  );

  useEffect(
    () => {
      if (!logHandle) {
        return noop;
      }

      let timeoutHandle: number | null = null;

      (async () => {
        const buffer = new Uint8Array(1024);

        const append = async () => {
          const bytes = await logHandle!.read(buffer);

          if (bytes === null) {
            timeoutHandle = setTimeout(append, 100);
            return;
          }

          setLogBuffer((current) => {
            const newLines = split(
              '\n',
              `${current}${utf8.decode(buffer)}`,
            );
            if (size(newLines) > 1) {
              setLogs((currentLogs) => {
                const newLogs = flow(
                  dropLast(1),
                  withKey(map)((log: string, idx: number) => [
                    currentLogs.length + idx,
                    log,
                  ]),
                )(newLines);

                return [
                  ...currentLogs,
                  ...newLogs as LogLine[],
                ];
              });
              setTimeout(() => {
                scrollMarker.current!.scrollIntoView();
              }, 0);
            }

            return last(newLines)!;
          });

          timeoutHandle = setTimeout(append, 0);
        };

        append();
      })();

      return () => {
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
        }
      };
    },
    [logHandle],
  );

  return (
    <Grid
      container
      direction="column"
      flex="1 0 0"
    >
      <Grid>Logs</Grid>
      <Grid
        container
        flex="1 0 0"
        component={Paper}
        elevation={3}
        sx={{
          boxShadow: 'inset 10px 10px 10px -10px rgba(0,0,0,0.75), inset -10px -10px 10px -10px rgba(0,0,0,0.75)',
          overflowX: 'hidden',
          overflowY: 'auto',
          p: '.5em',
          fontFamily: 'monospace',
        }}
      >
        <Grid
          container
          direction="column"
          flex="1 0 auto"
          sx={{
            height: 'min-content',
            pr: '.5em',
            mr: '.5em',
            textAlign: 'right',
            borderRight: '1px solid #E0E0E0',
            userSelect: 'none',
          }}
        >
          {map(
            ([line]) => (
              <Grid key={line}>
                {line}
              </Grid>
            ),
          )(logs)}
        </Grid>
        <Grid
          flex="1 1 100%"
          container
          direction="column"
          sx={{
            height: 'min-content',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          {map(
            ([line, log]) => (
              <Grid key={line}>
                &nbsp;
                {log}
              </Grid>
            ),
          )(logs)}
          <div ref={scrollMarker} />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ProjectDashboardLogs;
