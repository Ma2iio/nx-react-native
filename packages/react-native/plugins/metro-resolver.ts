import * as metroResolver from 'metro-resolver';
import type { MatchPath } from 'tsconfig-paths';
import { createMatchPath, loadConfig } from 'tsconfig-paths';
import * as chalk from 'chalk';

/*
 * Use tsconfig to resolve additional workspace libs.
 *
 * This resolve function requires projectRoot to be set to
 * workspace root in order modules and assets to be registered and watched.
 */
export function resolveRequest(
  _context: any,
  moduleName: string,
  platform: string | null
) {
  const debug = process.env.NX_REACT_NATIVE_DEBUG === 'true';
  console.log(
    chalk.cyan(
      `[Nx] Resolving: ${moduleName}`
    )
  );

  const { resolveRequest, ...context } = _context;
  try {
    return metroResolver.resolve(context, moduleName, platform);
  } catch {
    if (debug)
      console.log(
        chalk.cyan(
          `[Nx] Unable to resolve with default Metro resolver: ${moduleName}`
        )
      );
  }
  const matcher = getMatcher(debug);
  const match = matcher(moduleName);
  if (match) {
    return {
      type: 'sourceFile',
      filePath: match,
    };
  }
}

let matcher: MatchPath;

function getMatcher(debug?: boolean) {
  if (!matcher) {
    const result = loadConfig();
    if (result.resultType === 'success') {
      const { absoluteBaseUrl, paths } = result;
      if (debug) {
        console.log(
          chalk.cyan(`[Nx] Located tsconfig at ${chalk.bold(absoluteBaseUrl)}`)
        );
        console.log(
          chalk.cyan(
            `[Nx] Found the following paths:\n:${chalk.bold(
              JSON.stringify(paths, null, 2)
            )}`
          )
        );
      }
      matcher = createMatchPath(absoluteBaseUrl, paths);
    } else {
      console.log(chalk.cyan(`[Nx] Failed to locate tsconfig}`));
      throw new Error(`Could not load tsconfig for project`);
    }
  }
  return matcher;
}
