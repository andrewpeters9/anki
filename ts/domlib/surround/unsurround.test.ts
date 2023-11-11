// Copyright: Ankitects Pty Ltd and contributors
// License: GNU AGPL, version 3 or later; http://www.gnu.org/licenses/agpl.html

import { assertEquals } from "testing/asserts.ts";
import { beforeEach } from "testing/bdd.ts";

import { unsurround } from "./surround.ts";
import { easyBold, p } from "./test-utils.ts";

Deno.test("unsurround text", () => {
    let body: HTMLBodyElement;

    beforeEach(() => {
        body = p("<b>test</b>");
    });

    Deno.test("normalizes nodes", () => {
        const range = new Range();
        range.selectNode(body.firstChild!);

        unsurround(range, body, easyBold);
        assertEquals(body.innerHTML, "test");
        // assertEquals(surroundedRange.toString(), "test");
    });
});

// Deno.test("unsurround element and text", () => {
//     let body: HTMLBodyElement;

//     beforeEach(() => {
//         body = p("<b>before</b>after");
//     });

//     Deno.test("normalizes nodes", () => {
//         const range = new Range();
//         range.setStartBefore(body.childNodes[0].firstChild!);
//         range.setEndAfter(body.childNodes[1]);

//         const surroundedRange = unsurround(range, body, easyBold);

//         assertEquals(body.innerHTML, "beforeafter");
//         assertEquals(surroundedRange.toString(), "beforeafter");
//     });
// });

Deno.test("unsurround element with surrounding text", () => {
    let body: HTMLBodyElement;

    beforeEach(() => {
        body = p("11<b>22</b>33");
    });

    Deno.test("normalizes nodes", () => {
        const range = new Range();
        range.selectNode(body.firstElementChild!);

        unsurround(range, body, easyBold);

        assertEquals(body.innerHTML, "112233");
        // assertEquals(surroundedRange.toString(), "22");
    });
});

// Deno.test("unsurround from one element to another", () => {
//     let body: HTMLBodyElement;

//     beforeEach(() => {
//         body = p("<b>111</b>222<b>333</b>");
//     });

//     Deno.test("unsurround whole", () => {
//         const range = new Range();
//         range.setStartBefore(body.children[0].firstChild!);
//         range.setEndAfter(body.children[1].firstChild!);

//         unsurround(range, body, easyBold);

//         assertEquals(body.innerHTML, "111222333");
//         // assertEquals(surroundedRange.toString(), "22");
//     });
// });

// Deno.test("unsurround text portion of element", () => {
//     let body: HTMLBodyElement;

//     beforeEach(() => {
//         body = p("<b>112233</b>");
//     });

//     Deno.test("normalizes nodes", () => {
//         const range = new Range();
//         range.setStart(body.firstChild!, 2);
//         range.setEnd(body.firstChild!, 4);

//         const { addedNodes, removedNodes } = unsurround(
//             range,
//             document.createElement("b"),
//             body,
//         );

//         assertEquals(addedNodes.length, 2);
//         assertEquals(removedNodes.length, 1);
//         assertEquals(body.innerHTML, "<b>11</b>22<b>33</b>");
//         // assertEquals(surroundedRange.toString(), "22");
//     });
// });

Deno.test("with bold around block item", () => {
    let body: HTMLBodyElement;

    beforeEach(() => {
        body = p("<b>111<br><ul><li>222</li></ul></b>");
    });

    Deno.test("unsurround list item", () => {
        const range = new Range();
        range.selectNodeContents(
            body.firstChild!.childNodes[2].firstChild!.firstChild!,
        );

        unsurround(range, body, easyBold);

        assertEquals(body.innerHTML, "<b>111</b><br><ul><li>222</li></ul>");
        // assertEquals(surroundedRange.toString(), "222");
    });
});

Deno.test("with two double nested and one single nested", () => {
    // Deno.test("unsurround one double and single nested", () => {
    //     const body = p("<b><b>aaa</b><b>bbb</b>ccc</b>");
    //     const range = new Range();
    //     range.setStartBefore(body.firstChild!.childNodes[1].firstChild!);
    //     range.setEndAfter(body.firstChild!.childNodes[2]);

    //     const surroundedRange = unsurround(
    //         range,
    //         body,
    //         easyBold,
    //     );

    //     assertEquals(body.innerHTML, "<b>aaa</b>bbbccc");
    //     assertEquals(surroundedRange.toString(), "bbbccc");
    // });

    Deno.test("unsurround single and one double nested", () => {
        const body = p("<b>aaa<b>bbb</b><b>ccc</b></b>");
        const range = new Range();
        range.setStartBefore(body.firstChild!.firstChild!);
        range.setEndAfter(body.firstChild!.childNodes[1].firstChild!);

        const surroundedRange = unsurround(range, body, easyBold);
        assertEquals(body.innerHTML, "aaabbb<b>ccc</b>");
        assertEquals(surroundedRange.toString(), "aaabbb");
    });
});
