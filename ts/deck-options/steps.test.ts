// Copyright: Ankitects Pty Ltd and contributors
// License: GNU AGPL, version 3 or later; http://www.gnu.org/licenses/agpl.html
import { describe, it } from "testing/bdd.ts";
import { assertEquals } from "testing/asserts.ts";

import { stepsToString, stringToSteps } from "./steps";

describe("steps formatting", () => {
  it("whole steps", () => {
    const steps = [1, 10, 60, 120, 1440];
    const expected = "1m 10m 1h 2h 1d";
    assertEquals(stepsToString(steps), expected);
    assertEquals(stringToSteps(expected), steps);
  });

  it("fractional steps", () => {
    const steps = [1 / 60, 5 / 60, 1.5, 400];
    const expected = "1s 5s 90s 400m";
    assertEquals(stepsToString(steps), expected);
    assertEquals(stringToSteps(expected), steps);
  });

  it("rounding", () => {
    const steps = [0.1666666716337204];
    assertEquals(stepsToString(steps), "10s");
  });

  it("parsing", () => {
    assertEquals(stringToSteps(""), []);
    assertEquals(stringToSteps("    "), []);
    assertEquals(stringToSteps("1 hello 2"), [1, 2]);
  });
});
