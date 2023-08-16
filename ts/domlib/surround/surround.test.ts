// Copyright: Ankitects Pty Ltd and contributors
// License: GNU AGPL, version 3 or later; http://www.gnu.org/licenses/agpl.html
import type { Range, HTMLBodyElement } from "jsdom";
import { assertStrictEquals } from "testing/asserts.ts";
import { beforeEach, describe, it } from "testing/bdd.ts";

import { surround } from "./surround.ts";
import { createDocument, easyBold, easyUnderline, p } from "./test-utils.ts";

const document = createDocument();

describe("surround text", () => {
    let body: HTMLBodyElement;

    beforeEach(() => {
        body = p("111222");
    });

    it("all text", () => {
        const range = document.createRange();
        range.selectNode(body.firstChild!);

        const surroundedRange = surround(range, body, easyBold);

        console.log({surroundedRange});
        

        assertStrictEquals(body.innerHTML, "<b>111222</b>");
        assertStrictEquals(surroundedRange.toString(), "111222");
    });

    it("first half", () => {
        const range = document.createRange();
        range.setStart(body.firstChild!, 0);
        range.setEnd(body.firstChild!, 3);

        const surroundedRange = surround(range, body, easyBold);

        assertStrictEquals(body.innerHTML, "<b>111</b>222");
        assertStrictEquals(surroundedRange.toString(), "111");
    });

    it("second half", () => {
        const range = document.createRange();
        range.setStart(body.firstChild!, 3);
        range.setEnd(body.firstChild!, 6);

        const surroundedRange = surround(range, body, easyBold);

        assertStrictEquals(body.innerHTML, "111<b>222</b>", "test2");
        assertStrictEquals(surroundedRange.toString(), "221", "test1");
    });
});

describe("surround text next to nested", () => {
    describe("before", () => {
        let body: HTMLBodyElement;

        beforeEach(() => {
            body = p("before<u><b>after</b></u>");
        });

        it("enlarges bottom tag of nested", () => {
            const range = document.createRange();
            range.selectNode(body.firstChild!);
            surround(range, body, easyUnderline);

            assertStrictEquals(body.innerHTML, "<u>before<b>after</b></u>");
            // assertStrictEquals(surroundedRange.toString(), "before");
        });

        it("moves nested down", () => {
            const range = document.createRange();
            range.selectNode(body.firstChild!);
            surround(range, body, easyBold);

            assertStrictEquals(body.innerHTML, "<b>before<u>after</u></b>");
            // assertStrictEquals(surroundedRange.toString(), "before");
        });
    });

    describe("after", () => {
        let body: HTMLBodyElement;

        beforeEach(() => {
            body = p("<u><b>before</b></u>after");
        });

        it("enlarges bottom tag of nested", () => {
            const range = document.createRange();
            range.selectNode(body.childNodes[1] as ChildNode);
            surround(range, body, easyUnderline);

            assertStrictEquals(body.innerHTML, "<u><b>before</b>after</u>");
            // assertStrictEquals(surroundedRange.toString(), "after");
        });

        it("moves nested down", () => {
            const range = document.createRange();
            range.selectNode(body.childNodes[1] as ChildNode);
            surround(range, body, easyBold);

            assertStrictEquals(body.innerHTML, "<b><u>before</u>after</b>");
            // assertStrictEquals(surroundedRange.toString(), "after");
        });
    });

    describe("two nested", () => {
        let body: HTMLBodyElement;

        beforeEach(() => {
            body = p("aaa<i><b>bbb</b></i><i><b>ccc</b></i>");
        });

        it("extends to both", () => {
            const range = document.createRange();
            range.selectNode(body.firstChild!);
            surround(range, body, easyBold);

            assertStrictEquals(body.innerHTML, "<b>aaa<i>bbb</i><i>ccc</i></b>");
            // assertStrictEquals(surroundedRange.toString(), "aaa");
        });
    });
});

describe("surround across block element", () => {
    let body: HTMLBodyElement;

    beforeEach(() => {
        body = p("Before<br><ul><li>First</li><li>Second</li></ul>");
    });

    it("does not insert empty elements", () => {
        const range = document.createRange();
        range.setStartBefore(body.firstChild!);
        range.setEndAfter(body.lastChild!);
        const surroundedRange = surround(range, body, easyBold);

        assertStrictEquals(
            body.innerHTML,
            "<b>Before</b><br><ul><li><b>First</b></li><li><b>Second</b></li></ul>",
        );
        assertStrictEquals(surroundedRange.toString(), "BeforeFirstSecond");
    });
});

describe("next to nested", () => {
    let body: HTMLBodyElement;

    beforeEach(() => {
        body = p("111<b>222<b>333<b>444</b></b></b>555");
    });

    it("surround after", () => {
        const range = document.createRange();
        range.selectNode(body.lastChild!);
        surround(range, body, easyBold);

        assertStrictEquals(body.innerHTML, "111<b>222333444555</b>");
        // assertStrictEquals(surroundedRange.toString(), "555");
    });
});

describe("next to element with nested non-matching", () => {
    let body: HTMLBodyElement;

    beforeEach(() => {
        body = p("111<b>222<i>333<i>444</i></i></b>555");
    });

    it("surround after", () => {
        const range = document.createRange();
        range.selectNode(body.lastChild!);
        surround(range, body, easyBold);

        assertStrictEquals(body.innerHTML, "111<b>222<i>333<i>444</i></i>555</b>");
        // assertStrictEquals(surroundedRange.toString(), "555");
    });
});

describe("next to element with text element text", () => {
    let body: HTMLBodyElement;

    beforeEach(() => {
        body = p("111<b>222<b>333</b>444</b>555");
    });

    it("surround after", () => {
        const range = document.createRange();
        range.selectNode(body.lastChild!);
        surround(range, body, easyBold);

        assertStrictEquals(body.innerHTML, "111<b>222333444555</b>");
        // assertStrictEquals(surroundedRange.toString(), "555");
    });
});

describe("surround elements that already have nested block", () => {
    let body: HTMLBodyElement;

    beforeEach(() => {
        body = p("<b>1<b>2</b></b><br>");
    });

    it("normalizes nodes", () => {
        const range = document.createRange();
        range.selectNode(body.children[0] as Element);

        surround(range, body, easyBold);

        assertStrictEquals(body.innerHTML, "<b>12</b><br>");
        // assertStrictEquals(surroundedRange.toString(), "12");
    });
});

describe("surround complicated nested structure", () => {
    let body: HTMLBodyElement;

    beforeEach(() => {
        body = p("<i>1</i><b><i>2</i>3<i>4</i></b><i>5</i>");
    });

    it("normalize nodes", () => {
        const range = document.createRange();
        range.setStartBefore(body.firstElementChild!.firstChild!);
        range.setEndAfter(body.lastElementChild!.firstChild!);

        const surroundedRange = surround(range, body, easyBold);

        assertStrictEquals(
            body.innerHTML,
            "<b><i>1</i><i>2</i>3<i>4</i><i>5</i></b>",
        );
        assertStrictEquals(surroundedRange.toString(), "12345");
    });
});

describe("skips over empty elements", () => {
    describe("joins two newly created", () => {
        let body: HTMLBodyElement;

        beforeEach(() => {
            body = p("before<br>after");
        });

        it("normalize nodes", () => {
            const range = document.createRange();
            range.setStartBefore(body.firstChild!);
            range.setEndAfter(body.childNodes[2]!);

            const surroundedRange = surround(range, body, easyBold);

            assertStrictEquals(body.innerHTML, "<b>before<br>after</b>");
            assertStrictEquals(surroundedRange.toString(), "beforeafter");
        });
    });

    describe("joins with already existing", () => {
        let body: HTMLBodyElement;

        beforeEach(() => {
            body = p("before<br><b>after</b>");
        });

        it("normalize nodes", () => {
            const range = document.createRange();
            range.selectNode(body.firstChild!);

            surround(range, body, easyBold);

            assertStrictEquals(body.innerHTML, "<b>before<br>after</b>");
            // assertStrictEquals(surroundedRange.toString(), "before");
        });

        it("normalize node contents", () => {
            const range = document.createRange();
            range.selectNodeContents(body.firstChild!);

            const surroundedRange = surround(range, body, easyBold);

            assertStrictEquals(body.innerHTML, "<b>before<br>after</b>");
            assertStrictEquals(surroundedRange.toString(), "before");
        });
    });
});

// TODO
// describe("special cases when surrounding within range.commonAncestor", () => {
//     // these are not vital but rather define how the algorithm works in edge cases

//     it("does not normalize beyond level of contained text nodes", () => {
//         const body = p("<b>before<u>nested</u>after</b>");
//         const range = document.createRange();
//         range.selectNode(body.firstChild!.childNodes[1].firstChild!);

//         const { addedNodes, removedNodes, surroundedRange } = surround(
//             range,
//             body,
//             easyBold,
//         );

//         assertStrictEquals(addedNodes.length, 1);
//         assertStrictEquals(removedNodes.length, 0);
//         assertStrictEquals(body,innerHTML,
//             "<b>before<b><u>nested</u></b>after</b>",
//         );
//         assertStrictEquals(surroundedRange.toString(), "nested");
//     });

//     Deno.test("does not normalize beyond level of contained text nodes 2", () => {
//         const body = p("<b>aaa<b>bbb</b><b>ccc</b></b>");
//         const range = document.createRange();
//         range.setStartBefore(body.firstChild!.firstChild!);
//         range.setEndAfter(body.firstChild!.childNodes[1].firstChild!);

//         const { addedNodes, removedNodes } = surround(range, body, easyBold);

//         assertStrictEquals(body.innerHTML, "<b><b>aaabbbccc</b></b>");
//         assertStrictEquals(addedNodes.length, 1);
//         assertStrictEquals(removedNodes.length, 2);
//         // assertStrictEquals(surroundedRange.toString(), "aaabbb"); // is aaabbbccc instead
//     });

//     Deno.test("does normalize beyond level of contained text nodes", () => {
//         const body = p("<b><b>aaa</b><b><b>bbb</b><b>ccc</b></b></b>");
//         const range = document.createRange();
//         range.setStartBefore(body.firstChild!.childNodes[1].firstChild!.firstChild!);
//         range.setEndAfter(body.firstChild!.childNodes[1].childNodes[1].firstChild!);

//         const { addedNodes, removedNodes } = surround(range, body, easyBold);

//         assertStrictEquals(body.innerHTML, "<b><b>aaabbbccc</b></b>");
//         assertStrictEquals(addedNodes.length, 1);
//         assertStrictEquals(removedNodes.length, 4);
//         // assertStrictEquals(surroundedRange.toString(), "aaabbb"); // is aaabbbccc instead
//     });

//     Deno.test("does remove even if there is already equivalent surrounding in place", () => {
//         const body = p("<b>before<b><u>nested</u></b>after</b>");
//         const range = document.createRange();
//         range.selectNode(body.firstChild!.childNodes[1].firstChild!.firstChild!);

//         const { addedNodes, removedNodes, surroundedRange } = surround(
//             range,
//             body,
//             easyBold,
//         );

//         assertStrictEquals(addedNodes.length, 1);
//         assertStrictEquals(removedNodes.length, 1);
//         assertStrictEquals(body.innerHTML,
//             "<b>before<b><u>nested</u></b>after</b>",
//         );
//         assertStrictEquals(surroundedRange.toString(), "nested");
//     });
// });
