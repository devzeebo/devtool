export type HealthcheckCommand = {
  type: 'healthcheck',
  cron: string,
  command: string,
  args?: string[],
  expect: string,
};

export type StartCommand = {
  name: string,
  command: string,
  args?: string[],
};

export type Command = HealthcheckCommand | StartCommand;
