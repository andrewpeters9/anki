// Copyright: Ankitects Pty Ltd and contributors
// License: GNU AGPL, version 3 or later; http://www.gnu.org/licenses/agpl.html

import { SchedulingStatesWithContext } from "@tslib/anki/frontend_pb";
import { SchedulingContext, SchedulingStates } from "@tslib/anki/scheduler_pb";
import { assert, assertEquals, assertNotMatch, assertStrictEquals, assertThrows } from "testing/asserts.ts";

import { applyStateTransform } from "./answering.ts";

/* eslint
@typescript-eslint/no-explicit-any: "off",
 */

function exampleInput(): SchedulingStatesWithContext {
    return SchedulingStatesWithContext.fromJson({
        states: {
            current: {
                normal: {
                    review: {
                        scheduledDays: 1,
                        elapsedDays: 2,
                        easeFactor: 1.850000023841858,
                        lapses: 4,
                        leeched: false,
                    },
                },
                customData: "{\"v\":\"v3.20.0\",\"seed\":2104,\"d\":5.39,\"s\":11.06}",
            },
            again: {
                normal: {
                    relearning: {
                        review: {
                            scheduledDays: 1,
                            elapsedDays: 0,
                            easeFactor: 1.649999976158142,
                            lapses: 5,
                            leeched: false,
                        },
                        learning: {
                            remainingSteps: 1,
                            scheduledSecs: 600,
                        },
                    },
                },
            },
            hard: {
                normal: {
                    review: {
                        scheduledDays: 2,
                        elapsedDays: 0,
                        easeFactor: 1.7000000476837158,
                        lapses: 4,
                        leeched: false,
                    },
                },
            },
            good: {
                normal: {
                    review: {
                        scheduledDays: 4,
                        elapsedDays: 0,
                        easeFactor: 1.850000023841858,
                        lapses: 4,
                        leeched: false,
                    },
                },
            },
            easy: {
                normal: {
                    review: {
                        scheduledDays: 6,
                        elapsedDays: 0,
                        easeFactor: 2,
                        lapses: 4,
                        leeched: false,
                    },
                },
            },
        },
        context: { deckName: "hello", seed: 123 },
    });
}

Deno.test("can change oneof", () => {
    let states = exampleInput().states!;
    const jsonStates = states.toJson({ emitDefaultValues: true }) as any;
    // again should be a relearning state
    const inner = states.again?.kind?.value?.kind;
    assert(inner?.case === "relearning");
    assertEquals(inner.value.learning?.remainingSteps, 1);
    // change it to a review state
    jsonStates.again.normal = {
        review: jsonStates.again.normal.relearning.review,
    };
    states = SchedulingStates.fromJson(jsonStates);
    const inner2 = states.again?.kind?.value?.kind;
    assert(inner2?.case === "review");
    // however, it's not valid to have multiple oneofs set
    jsonStates.again.normal = {
        review: jsonStates.again.normal.review,
        learning: {},
    };
    assertThrows(() => {
        SchedulingStates.fromJson(jsonStates);
    });
});

Deno.test("no-op transform", async () => {
    const input = exampleInput();
    const output = await applyStateTransform(
        input,
        (states: any, customData, ctx) => {
            assertEquals(ctx.deckName, "hello");
            assertEquals(customData.easy.seed, 2104);
            assertEquals(
                states!.again!.normal!.relearning!.learning!.remainingSteps,
                1,
            );
        },
    );
    // the input only has customData set on `current`, so we need to update it
    // before we compare the two as equal
    input.states!.again!.customData = input.states!.current!.customData;
    input.states!.hard!.customData = input.states!.current!.customData;
    input.states!.good!.customData = input.states!.current!.customData;
    input.states!.easy!.customData = input.states!.current!.customData;
    assertStrictEquals(output, input.states);
});

Deno.test("custom data change", async () => {
    const output = await applyStateTransform(
        exampleInput(),
        async (_states: any, customData, _ctx) => {
            customData.easy = { foo: "hello world" };
        },
    );

    assertNotMatch(output!.hard!.customData, /hello world/);
    assertEquals(output!.easy!.customData, "{\"foo\":\"hello world\"}");
});

Deno.test("adjust interval", async () => {
    const output = await applyStateTransform(
        exampleInput(),
        async (states: any, _customData, _ctx) => {
            states.good.normal.review.scheduledDays = 10;
        },
    );
    const kind = output.good?.kind?.value?.kind;
    assert(kind?.case === "review");
    assertEquals(kind.value.scheduledDays, 10);
});

Deno.test("default context values exist", () => {
    const ctx = SchedulingContext.fromBinary(new Uint8Array());
    assertEquals(ctx.deckName, "");
    assertEquals(ctx.seed, 0n);
});
