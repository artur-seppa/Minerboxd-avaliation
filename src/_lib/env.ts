const getEnvValue =
  <P extends (value: string) => any>(parser: P) =>
  (key: string, fallback: ReturnType<P>): ReturnType<P> => {
    const value = process.env[key];

    if (!value) {
      if (fallback === undefined) {
        throw Error(`Missing key ${key} from env and no fallback was provided`);
      }

      return fallback;
    }

    return parser(value);
  };

export const Env = {
  string: getEnvValue(String),
  number: getEnvValue(Number),
};

export type EnvType = 'development' | 'test';
