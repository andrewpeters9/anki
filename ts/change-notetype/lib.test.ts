// Copyright: Ankitects Pty Ltd and contributors
// License: GNU AGPL, version 3 or later; http://www.gnu.org/licenses/agpl.html

/* eslint
@typescript-eslint/no-explicit-any: "off",
 */

import "@tslib/i18n";

import { ChangeNotetypeInfo, NotetypeNames } from "@tslib/anki/notetypes_pb";
import * as tr from "@tslib/ftl";
import { get } from "svelte/store";
import { assert, assertEquals, assertFalse } from "testing/asserts.ts";

import { ChangeNotetypeState, MapContext, negativeOneToNull } from "./lib.ts";

const exampleNames = {
    entries: [
        {
            id: 1623289129847n,
            name: "Basic",
        },
        {
            id: 1623289129848n,
            name: "Basic (and reversed card)",
        },
        {
            id: 1623289129849n,
            name: "Basic (optional reversed card)",
        },
        {
            id: 1623289129850n,
            name: "Basic (type in the answer)",
        },
        {
            id: 1623289129851n,
            name: "Cloze",
        },
    ],
};

const exampleInfoDifferent = {
    oldFieldNames: ["Front", "Back"],
    oldTemplateNames: ["Card 1"],
    newFieldNames: ["Front", "Back", "Add Reverse"],
    newTemplateNames: ["Card 1", "Card 2"],
    input: {
        newFields: [0, 1, -1],
        newTemplates: [0, -1],
        oldNotetypeId: 1623289129847n,
        newNotetypeId: 1623289129849n,
        currentSchema: 1623302002316n,
        oldNotetypeName: "Basic",
    },
};

const exampleInfoSame = {
    oldFieldNames: ["Front", "Back"],
    oldTemplateNames: ["Card 1"],
    newFieldNames: ["Front", "Back"],
    newTemplateNames: ["Card 1"],
    input: {
        newFields: [0, 1],
        newTemplates: [0],
        oldNotetypeId: 1623289129847n,
        newNotetypeId: 1623289129847n,
        currentSchema: 1623302002316n,
        oldNotetypeName: "Basic",
    },
};

function differentState(): ChangeNotetypeState {
    return new ChangeNotetypeState(
        new NotetypeNames(exampleNames),
        new ChangeNotetypeInfo(exampleInfoDifferent),
    );
}

function sameState(): ChangeNotetypeState {
    return new ChangeNotetypeState(
        new NotetypeNames(exampleNames),
        new ChangeNotetypeInfo(exampleInfoSame),
    );
}

Deno.test("proto conversion", () => {
    const state = differentState();
    assertEquals(get(state.info).fields, [0, 1, null]);
    assertEquals(negativeOneToNull(state.dataForSaving().newFields), [
        0,
        1,
        null,
    ]);
});

Deno.test("mapping", () => {
    const state = differentState();

    assertEquals(get(state.info).getNewName(MapContext.Field, 0), "Front");
    assertEquals(get(state.info).getNewName(MapContext.Field, 1), "Back");
    assertEquals(get(state.info).getNewName(MapContext.Field, 2), "Add Reverse");

    assertEquals(get(state.info).getOldNamesIncludingNothing(MapContext.Field), [
        "Front",
        "Back",
        tr.changeNotetypeNothing(),
    ]);

    assertEquals(get(state.info).getOldIndex(MapContext.Field, 0), 0);
    assertEquals(get(state.info).getOldIndex(MapContext.Field, 1), 1);
    assertEquals(get(state.info).getOldIndex(MapContext.Field, 2), 2);

    state.setOldIndex(MapContext.Field, 2, 0);
    assertEquals(get(state.info).getOldIndex(MapContext.Field, 2), 0);

    // the same template shouldn't be mappable twice
    assertEquals(
        get(state.info).getOldNamesIncludingNothing(MapContext.Template),
        ["Card 1", tr.changeNotetypeNothing()],
    );

    assertEquals(get(state.info).getOldIndex(MapContext.Template, 0), 0);
    assertEquals(get(state.info).getOldIndex(MapContext.Template, 1), 1);

    state.setOldIndex(MapContext.Template, 1, 0);
    assertEquals(get(state.info).getOldIndex(MapContext.Template, 0), 1);
    assertEquals(get(state.info).getOldIndex(MapContext.Template, 1), 0);
});

Deno.test("unused", () => {
    const state = differentState();
    assertEquals(get(state.info).unusedItems(MapContext.Field), []);

    state.setOldIndex(MapContext.Field, 0, 2);
    assertEquals(get(state.info).unusedItems(MapContext.Field), ["Front"]);
});

Deno.test("unchanged", () => {
    let state = differentState();
    assertFalse(get(state.info).unchanged());

    state = sameState();
    assert(get(state.info).unchanged());
});
