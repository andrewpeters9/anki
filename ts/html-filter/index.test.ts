// Copyright: Ankitects Pty Ltd and contributors
// License: GNU AGPL, version 3 or later; http://www.gnu.org/licenses/agpl.html

import { filterHTML } from ".";
import { assertEquals } from "assert/mod.ts";

Deno.test("zero input creates zero output", () => {
  assertEquals(filterHTML("", true, false), "");
  assertEquals(filterHTML("", true, false), "");
  assertEquals(filterHTML("", false, false), "");
});

Deno.test("internal filtering", () => {
  assertEquals(
    filterHTML(
      `<div style="font-weight: bold; font-size: 10px;"></div>`,
      true,
      true
    ),
    `<div style="font-weight: bold;"></div>`
  );
});

Deno.test("background color", () => {
  assertEquals(
    filterHTML(
      `<span style="background-color: transparent;"></span>`,
      false,
      true
    ),
    `<span style=""></span>`
  );

  assertEquals(
    filterHTML(`<span style="background-color: blue;"></span>`, false, true),
    `<span style="background-color: blue;"></span>`
  );

  assertEquals(
    filterHTML(`<span style="background-color: blue;">x</span>`, false, false),
    "x"
  );

  assertEquals(
    filterHTML(
      `<span style="background-color: transparent;"></span>`,
      true,
      true
    ),
    `<span style="background-color: transparent;"></span>`
  );
});
