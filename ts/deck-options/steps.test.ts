// Copyright: Ankitects Pty Ltd and contributors
// License: GNU AGPL, version 3 or later; http://www.gnu.org/licenses/agpl.html

import { stepsToString, stringToSteps } from "./steps";
import { assertEquals } from "https://deno.land/std@0.147.0/testing/asserts.ts";

Deno.test("whole steps", () => {
  const steps = [1, 10, 60, 120, 1440];
  const string = "1m 10m 1h 2h 1d";

  assertEquals(stepsToString(steps), string);
  assertEquals(stringToSteps(string), steps);
});

Deno.test("fractional steps", () => {
  const steps = [1 / 60, 5 / 60, 1.5, 400];
  const string = "1s 5s 90s 400m";

  assertEquals(stepsToString(steps), string);
  assertEquals(stringToSteps(string), steps);
});

Deno.test("rounding", () => {
  const steps = [0.1666666716337204];

  assertEquals(stepsToString(steps), "10s");
});

Deno.test("parsing", () => {
  assertEquals(stringToSteps(""), []);
  assertEquals(stringToSteps("    "), []);
  assertEquals(stringToSteps("1 hello 2"), [1, 2]);  
});