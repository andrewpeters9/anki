// Copyright: Ankitects Pty Ltd and contributors
// License: GNU AGPL, version 3 or later; http://www.gnu.org/licenses/agpl.html
import { assertEquals } from "testing/asserts.ts";

import { naturalUnit, naturalWholeUnit, TimespanUnit } from "./time";

Deno.test("natural unit", () => {
  assertEquals(naturalUnit(5), TimespanUnit.Seconds);
  assertEquals(naturalUnit(59), TimespanUnit.Seconds);
  assertEquals(naturalUnit(60), TimespanUnit.Minutes);
  assertEquals(naturalUnit(60 * 60 - 1), TimespanUnit.Minutes);
  assertEquals(naturalUnit(60 * 60), TimespanUnit.Hours);
  assertEquals(naturalUnit(60 * 60 * 24), TimespanUnit.Days);
  assertEquals(naturalUnit(60 * 60 * 24 * 30), TimespanUnit.Months);
});

Deno.test("natural whole unit", () => {
  assertEquals(naturalWholeUnit(5), TimespanUnit.Seconds);
  assertEquals(naturalWholeUnit(59), TimespanUnit.Seconds);
  assertEquals(naturalWholeUnit(60), TimespanUnit.Minutes);
  assertEquals(naturalWholeUnit(61), TimespanUnit.Seconds);
  assertEquals(naturalWholeUnit(90), TimespanUnit.Seconds);
  assertEquals(naturalWholeUnit(60 * 60 - 1), TimespanUnit.Seconds);
  assertEquals(naturalWholeUnit(60 * 60 + 1), TimespanUnit.Seconds);
  assertEquals(naturalWholeUnit(60 * 60), TimespanUnit.Hours);
  assertEquals(naturalWholeUnit(24 * 60 * 60 - 1), TimespanUnit.Seconds);
  assertEquals(naturalWholeUnit(24 * 60 * 60 + 1), TimespanUnit.Seconds);
  assertEquals(naturalWholeUnit(24 * 60 * 60), TimespanUnit.Days);
});
