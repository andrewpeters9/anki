// Copyright: Ankitects Pty Ltd and contributors
// License: GNU AGPL, version 3 or later; http://www.gnu.org/licenses/agpl.html

import { registerPackage } from "../../lib/runtime-require.ts";
import { restoreSelection, saveSelection } from "./document.ts";
import { Position } from "./location.ts";
import { findNodeFromCoordinates, getNodeCoordinates } from "./node.ts";
import { getRangeCoordinates } from "./range.ts";

registerPackage("anki/location", {
    Position,
    restoreSelection,
    saveSelection,
});

export { findNodeFromCoordinates, getNodeCoordinates, getRangeCoordinates, Position, restoreSelection, saveSelection };
export type { RangeCoordinates } from "./range.ts";
export type { SelectionLocation } from "./selection.ts";
