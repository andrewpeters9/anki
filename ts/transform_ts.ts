// Copyright: Ankitects Pty Ltd and contributors
// License: GNU AGPL, version 3 or later; http://www.gnu.org/licenses/agpl.html

import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.8.1/mod.ts";
import * as esbuild from "https://deno.land/x/esbuild@v0.17.19/mod.js";

const [entrypoint = "ts/mathjax/index.ts", js_out = "./dist/mathjax.js"] =
  Deno.args;

// support Qt 5.14
const target = ["es6", "chrome77"];

const result = await esbuild.build({
  plugins: [...denoPlugins()],
  bundle: false,
  entryPoints: [entrypoint],
  outfile: js_out,
  minify: true,
  preserveSymlinks: true,
  target,
});

console.log(result.outputFiles);

esbuild.stop();
