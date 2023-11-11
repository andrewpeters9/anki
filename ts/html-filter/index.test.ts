// Copyright: Ankitects Pty Ltd and contributors
// License: GNU AGPL, version 3 or later; http://www.gnu.org/licenses/agpl.html
import { assertEquals } from "testing/asserts.ts";

import { filterHTML } from ".";

Deno.test("filterHTML", () => {
    Deno.test("zero input creates zero output", () => {
        assertEquals(filterHTML("", true, false), "");
        assertEquals(filterHTML("", true, false), "");
        assertEquals(filterHTML("", false, false), "");
    });

    Deno.test("internal filtering", () => {
        // font-size is filtered, weight is not
        assertEquals(
            filterHTML(
                "<div style=\"font-weight: bold; font-size: 10px;\"></div>",
                true,
                true,
            ),
            "<div style=\"font-weight: bold;\"></div>",
        );
    });

    Deno.test("background color", () => {
        // transparent is stripped, other colors are not
        assertEquals(
            filterHTML(
                "<span style=\"background-color: transparent;\"></span>",
                false,
                true,
            ),
            "<span style=\"\"></span>",
        );

        assertEquals(
            filterHTML("<span style=\"background-color: blue;\"></span>", false, true),
            "<span style=\"background-color: blue;\"></span>",
        );

        // except if extended mode is off
        assertEquals(
            filterHTML(
                "<span style=\"background-color: blue;\">x</span>",
                false,
                false,
            ),
            "x",
        );

        // no filtering on internal paste
        assertEquals(
            filterHTML(
                "<span style=\"background-color: transparent;\"></span>",
                true,
                true,
            ),
            "<span style=\"background-color: transparent;\"></span>",
        );
    });
});
