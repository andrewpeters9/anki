// Copyright: Ankitects Pty Ltd and contributors
// License: GNU AGPL, version 3 or later; http://www.gnu.org/licenses/agpl.html

/* eslint
@typescript-eslint/no-explicit-any: "off",
 */

import { protoBase64 } from "@bufbuild/protobuf";
import { DeckConfig_Config_LeechAction, DeckConfigsForUpdate } from "@tslib/anki/deck_config_pb";
import { get } from "svelte/store";
import { assert, assertEquals, assertFalse, assertMatch, assertStrictEquals, assertThrows } from "testing/asserts.ts";

import { DeckOptionsState } from "./lib.ts";

const exampleData = {
    allConfig: [
        {
            config: {
                id: 1n,
                name: "Default",
                mtimeSecs: 1618570764n,
                usn: -1,
                config: {
                    learnSteps: [1, 10],
                    relearnSteps: [10],
                    newPerDay: 10,
                    reviewsPerDay: 200,
                    initialEase: 2.5,
                    easyMultiplier: 1.2999999523162842,
                    hardMultiplier: 1.2000000476837158,
                    intervalMultiplier: 1,
                    maximumReviewInterval: 36500,
                    minimumLapseInterval: 1,
                    graduatingIntervalGood: 1,
                    graduatingIntervalEasy: 4,
                    leechAction: DeckConfig_Config_LeechAction.TAG_ONLY,
                    leechThreshold: 8,
                    capAnswerTimeToSecs: 60,
                    other: protoBase64.dec(
                        "eyJuZXciOnsic2VwYXJhdGUiOnRydWV9LCJyZXYiOnsiZnV6eiI6MC4wNSwibWluU3BhY2UiOjF9fQ==",
                    ),
                },
            },
            useCount: 1,
        },
        {
            config: {
                id: 1618570764780n,
                name: "another one",
                mtimeSecs: 1618570781n,
                usn: -1,
                config: {
                    learnSteps: [1, 10, 20, 30],
                    relearnSteps: [10],
                    newPerDay: 40,
                    reviewsPerDay: 200,
                    initialEase: 2.5,
                    easyMultiplier: 1.2999999523162842,
                    hardMultiplier: 1.2000000476837158,
                    intervalMultiplier: 1,
                    maximumReviewInterval: 36500,
                    minimumLapseInterval: 1,
                    graduatingIntervalGood: 1,
                    graduatingIntervalEasy: 4,
                    leechAction: DeckConfig_Config_LeechAction.TAG_ONLY,
                    leechThreshold: 8,
                    capAnswerTimeToSecs: 60,
                },
            },
            useCount: 1,
        },
    ],
    currentDeck: {
        name: "Default::child",
        configId: 1618570764780n,
        parentConfigIds: [1n],
    },
    defaults: {
        config: {
            learnSteps: [1, 10],
            relearnSteps: [10],
            newPerDay: 20,
            reviewsPerDay: 200,
            initialEase: 2.5,
            easyMultiplier: 1.2999999523162842,
            hardMultiplier: 1.2000000476837158,
            intervalMultiplier: 1,
            maximumReviewInterval: 36500,
            minimumLapseInterval: 1,
            graduatingIntervalGood: 1,
            graduatingIntervalEasy: 4,
            leechAction: DeckConfig_Config_LeechAction.TAG_ONLY,
            leechThreshold: 8,
            capAnswerTimeToSecs: 60,
        },
    },
};

function startingState(): DeckOptionsState {
    return new DeckOptionsState(123n, new DeckConfigsForUpdate(exampleData));
}

Deno.test("start", () => {
    const state = startingState();
    assertEquals(state.currentDeck.name).toBe("Default::child");
});

Deno.test("deck list", () => {
    const state = startingState();
    assertStrictEquals(get(state.configList), [
        {
            current: true,
            idx: 0,
            name: "another one",
            useCount: 1,
        },
        {
            current: false,
            idx: 1,
            name: "Default",
            useCount: 1,
        },
    ]);
    assertEquals(get(state.currentConfig).newPerDay, 40);

    // rename
    state.setCurrentName("zzz");
    assertStrictEquals(get(state.configList), [
        {
            current: false,
            idx: 0,
            name: "Default",
            useCount: 1,
        },
        {
            current: true,
            idx: 1,
            name: "zzz",
            useCount: 1,
        },
    ]);

    // add
    state.addConfig("hello");
    assertStrictEquals(get(state.configList), [
        {
            current: false,
            idx: 0,
            name: "Default",
            useCount: 1,
        },
        {
            current: true,
            idx: 1,
            name: "hello",
            useCount: 1,
        },
        {
            current: false,
            idx: 2,
            name: "zzz",
            useCount: 0,
        },
    ]);
    assertEquals(get(state.currentConfig).newPerDay, 20);

    // change current
    state.setCurrentIndex(0);
    assertStrictEquals(get(state.configList), [
        {
            current: true,
            idx: 0,
            name: "Default",
            useCount: 2,
        },
        {
            current: false,
            idx: 1,
            name: "hello",
            useCount: 0,
        },
        {
            current: false,
            idx: 2,
            name: "zzz",
            useCount: 0,
        },
    ]);
    assertEquals(get(state.currentConfig).newPerDay, 10);

    // can't delete default
    assertThrows(() => state.removeCurrentConfig());

    // deleting old deck should work
    state.setCurrentIndex(1);
    state.removeCurrentConfig();
    assertEquals(get(state.currentConfig).newPerDay, 10);

    // as should newly added one
    state.setCurrentIndex(1);
    state.removeCurrentConfig();
    assertEquals(get(state.currentConfig).newPerDay, 10);

    // only the pre-existing deck should be listed for removal
    const out = state.dataForSaving(false);
    assertStrictEquals(out.removedConfigIds, [1618570764780n]);
});

Deno.test("duplicate name", () => {
    const state = startingState();

    // duplicate will get renamed
    state.addConfig("another one");
    assertMatch(
        get(state.configList).find((e) => e.current)?.name,
        /another.*\d+$/,
    );

    // should handle renames too
    state.setCurrentName("Default");
    assertMatch(
        get(state.configList).find((e) => e.current)?.name,
        /Default\d+$/,
    );
});

Deno.test("parent counts", () => {
    const state = startingState();

    assertStrictEquals(get(state.parentLimits), { newCards: 10, reviews: 200 });

    // adjusting the current deck config won't alter parent
    state.currentConfig.update((c) => {
        c.newPerDay = 123;
        return c;
    });
    assertStrictEquals(get(state.parentLimits), { newCards: 10, reviews: 200 });

    // but adjusting the default config will, since the parent deck uses it
    state.setCurrentIndex(1);
    state.currentConfig.update((c) => {
        c.newPerDay = 123;
        return c;
    });
    assertStrictEquals(get(state.parentLimits), {
        newCards: 123,
        reviews: 200,
    });
});

Deno.test("saving", () => {
    let state = startingState();
    let out = state.dataForSaving(false);
    assertStrictEquals(out.removedConfigIds, []);
    assertEquals(out.targetDeckId, 123n);
    // in no-changes case, currently selected config should
    // be returned
    assertEquals(out.configs!.length, 1);
    assertEquals(out.configs![0].name, "another one");
    assertFalse(out.applyToChildren);

    // rename, then change current deck
    state.setCurrentName("zzz");
    out = state.dataForSaving(true);
    state.setCurrentIndex(0);

    // renamed deck should be in changes, with current deck as last element
    out = state.dataForSaving(true);
    assertStrictEquals(
        out.configs!.map((c) => c.name),
        ["zzz", "Default"],
    );
    assert(out.applyToChildren);

    // start again, adding new deck
    state = startingState();
    state.addConfig("hello");

    // deleting it should not change removedConfigs
    state.removeCurrentConfig();
    out = state.dataForSaving(true);
    assertStrictEquals(out.removedConfigIds, []);

    // select the other non-default deck & remove
    state.setCurrentIndex(0);
    state.removeCurrentConfig();

    // should be listed in removedConfigs, and modified should
    // only contain Default, which is the new current deck
    out = state.dataForSaving(true);
    assertStrictEquals(out.removedConfigIds, [1618570764780n]);
    assertStrictEquals(
        out.configs!.map((c) => c.name),
        ["Default"],
    );
});

Deno.test("aux data", () => {
    const state = startingState();
    assertStrictEquals(get(state.currentAuxData), {});
    state.currentAuxData.update((val) => {
        return { ...val, hello: "world" };
    });

    // check default
    state.setCurrentIndex(1);
    assertStrictEquals(get(state.currentAuxData), {
        new: {
            separate: true,
        },
        rev: {
            fuzz: 0.05,
            minSpace: 1,
        },
    });
    state.currentAuxData.update((val) => {
        return { ...val, defaultAddition: true };
    });

    // ensure changes serialize
    const out = state.dataForSaving(true);
    assertEquals(out.configs!.length, 2);
    const json = out.configs!.map((c) => JSON.parse(new TextDecoder().decode(c.config!.other)));
    assertStrictEquals(json, [
        // other deck comes first
        {
            hello: "world",
        },
        // default is selected, so comes last
        {
            defaultAddition: true,
            new: {
                separate: true,
            },
            rev: {
                fuzz: 0.05,
                minSpace: 1,
            },
        },
    ]);
});
