import { RequestHandler } from 'express';
import { maxSatisfying } from 'semver';
import got from 'got';
import { NPMPackage, PackageVersions } from './types';

type Package = { version: string; dependencies: Record<string, Package> };
/**
 * Attempts to retrieve package data from the npm registry and return it
 */
const depenciesCache = new Map<string, PackageVersions>();

export const getPackage: RequestHandler = async function (req, res, next) {
  const splittedParam: string[] = req.params[0].split('/');
  const version: string = splittedParam.pop() || '';
  const name = splittedParam.join('/');

  if (!name || !version) {
    return res.status(400).json({ reason: 'Invalid format. The format package/:name/:version is expected.' });
  }

  const dependencyTree = {};
  try {
    const npmPackage: NPMPackage = await got(
      `https://registry.npmjs.org/${name}`,
    ).json();

    const parentPackages = new Set<string>([]);

    parentPackages.add(name);

    const dependencies: Record<string, string> =
      npmPackage.versions[version].dependencies ?? {};

    setCacheValue(npmPackage);

    for (const [depName, range] of Object.entries(dependencies)) {
      if (name !== depName) {
        const subDep = await getDependencies(depName, range, parentPackages);
        dependencyTree[depName] = subDep;
      }
    }

    return res
      .status(200)
      .json({ name, version, dependencies: dependencyTree });
  } catch (error: any) {
    // either this or an error-handler on the whole project (error-handler.ts)
    res.status(404).json({ message: 'Resource or version not found.' });
  }
};

async function getDependencies(name: string, range: string, parentPackages: Set<string>): Promise<Package> {
  let npmPackageVersions: PackageVersions;
  if (depenciesCache.has(name)) {
    npmPackageVersions = depenciesCache.get(name)!;
  } else {
    const npmPackage: NPMPackage = await got(
      `https://registry.npmjs.org/${name}`,
    ).json();

    setCacheValue(npmPackage);
    npmPackageVersions = npmPackage.versions;
  }

  const v = maxSatisfying(Object.keys(npmPackageVersions), range);
  const dependencies: Record<string, Package> = {};

  const parentPackagesCopy = new Set<string>(parentPackages);

  parentPackagesCopy.add(name);

  if (v) {
    const newDeps = npmPackageVersions[v].dependencies;
    for (const [name, range] of Object.entries(newDeps ?? {})) {
      if (!parentPackagesCopy.has(name)) {
        dependencies[name] = await getDependencies(name, range, parentPackagesCopy);
      }
    }
  }

  return { version: v ?? range, dependencies };
}

function setCacheValue(npmPackage: NPMPackage): void {
  const cacheObject: PackageVersions = {};
  for (const [key, value] of Object.entries(npmPackage.versions)) {
    cacheObject[key] = {
      name: npmPackage.name,
      version: key,
      dependencies: value.dependencies || {},
    };
  }
  depenciesCache.set(npmPackage.name, cacheObject);
}
