"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackage = void 0;
var semver_1 = require("semver");
var got_1 = require("got");
/**
 * Attempts to retrieve package data from the npm registry and return it
 */
var depenciesCache = new Map();
var getPackage = function (req, res, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var splittedParam, version, name, dependencyTree, npmPackage, parentPackages, dependencies, _i, _b, _c, depName, range, subDep, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    splittedParam = req.params[0].split('/');
                    version = splittedParam.pop() || '';
                    name = splittedParam.join('/');
                    if (!name || !version) {
                        return [2 /*return*/, res.status(400).json({ reason: 'Invalid format. The format package/:name/:version is expected.' })];
                    }
                    dependencyTree = {};
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, got_1.default("https://registry.npmjs.org/" + name).json()];
                case 2:
                    npmPackage = _d.sent();
                    parentPackages = new Set([]);
                    parentPackages.add(name);
                    dependencies = (_a = npmPackage.versions[version].dependencies) !== null && _a !== void 0 ? _a : {};
                    setCacheValue(npmPackage);
                    _i = 0, _b = Object.entries(dependencies);
                    _d.label = 3;
                case 3:
                    if (!(_i < _b.length)) return [3 /*break*/, 6];
                    _c = _b[_i], depName = _c[0], range = _c[1];
                    if (!(name !== depName)) return [3 /*break*/, 5];
                    return [4 /*yield*/, getDependencies(depName, range, parentPackages)];
                case 4:
                    subDep = _d.sent();
                    dependencyTree[depName] = subDep;
                    _d.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/, res
                        .status(200)
                        .json({ name: name, version: version, dependencies: dependencyTree })];
                case 7:
                    error_1 = _d.sent();
                    // either this or an error-handler on the whole project (error-handler.ts)
                    res.status(404).json({ message: 'Resource or version not found.' });
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
};
exports.getPackage = getPackage;
function getDependencies(name, range, parentPackages) {
    return __awaiter(this, void 0, void 0, function () {
        var npmPackageVersions, npmPackage, v, dependencies, parentPackagesCopy, newDeps, _i, _a, _b, name_1, range_1, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!depenciesCache.has(name)) return [3 /*break*/, 1];
                    npmPackageVersions = depenciesCache.get(name);
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, got_1.default("https://registry.npmjs.org/" + name).json()];
                case 2:
                    npmPackage = _e.sent();
                    setCacheValue(npmPackage);
                    npmPackageVersions = npmPackage.versions;
                    _e.label = 3;
                case 3:
                    v = semver_1.maxSatisfying(Object.keys(npmPackageVersions), range);
                    dependencies = {};
                    parentPackagesCopy = new Set(parentPackages);
                    parentPackagesCopy.add(name);
                    if (!v) return [3 /*break*/, 7];
                    newDeps = npmPackageVersions[v].dependencies;
                    _i = 0, _a = Object.entries(newDeps !== null && newDeps !== void 0 ? newDeps : {});
                    _e.label = 4;
                case 4:
                    if (!(_i < _a.length)) return [3 /*break*/, 7];
                    _b = _a[_i], name_1 = _b[0], range_1 = _b[1];
                    if (!!parentPackagesCopy.has(name_1)) return [3 /*break*/, 6];
                    _c = dependencies;
                    _d = name_1;
                    return [4 /*yield*/, getDependencies(name_1, range_1, parentPackagesCopy)];
                case 5:
                    _c[_d] = _e.sent();
                    _e.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7: return [2 /*return*/, { version: v !== null && v !== void 0 ? v : range, dependencies: dependencies }];
            }
        });
    });
}
function setCacheValue(npmPackage) {
    var cacheObject = {};
    for (var _i = 0, _a = Object.entries(npmPackage.versions); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        cacheObject[key] = {
            name: npmPackage.name,
            version: key,
            dependencies: value.dependencies || {},
        };
    }
    depenciesCache.set(npmPackage.name, cacheObject);
}
//# sourceMappingURL=package.js.map