// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Node.js v22 compatibility fixes for webpack bundling:
//
//  1. output.hashFunction "sha256" — switches chunk/module hashing away from
//     xxhash64 (WASM-based, crashes on Node 22) to native crypto.
//
//  2. snapshot hash:false — disables content-hash snapshots in FileSystemInfo.
//     On Node 22, webpack passes `undefined` to Hash.update() inside
//     FileSystemInfo, causing ERR_INVALID_ARG_TYPE. Using timestamp-only
//     snapshots avoids that code path entirely while still detecting changes.
Config.overrideWebpackConfig((config) => {
  const withTailwind = enableTailwind(config);
  return {
    ...withTailwind,
    output: {
      ...withTailwind.output,
      hashFunction: "sha256",
    },
    snapshot: {
      module:                { timestamp: true, hash: false },
      resolve:               { timestamp: true, hash: false },
      resolveBuildDependencies: { timestamp: true, hash: false },
      buildDependencies:     { timestamp: true, hash: false },
    },
  };
});
