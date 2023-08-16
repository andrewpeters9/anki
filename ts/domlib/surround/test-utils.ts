// Copyright: Ankitects Pty Ltd and contributors
// License: GNU AGPL, version 3 or later; http://www.gnu.org/licenses/agpl.html

import { JSDOM } from "jsdom";
import type { Node, Element, HTMLBodyElement } from "jsdom";
import type { MatchType } from "./match-type.ts";

const createHtmlString = (body: string) => `<!DOCTYPE html><html><head></head><body>${body}</body></html>`
export const createDocument = (body = "") =>  {
    const { window: { document } } = new JSDOM(
    createHtmlString(body),
  );

  return document;
}

const document = createDocument();

export const matchTagName = (tagName: string) => <T>(element: Element, match: MatchType<T>): void => {
    if (element.matches(tagName)) {
        match.remove();
    }
};

export const easyBold = {
    surroundElement: document.createElement("b"),
    matcher: matchTagName("b"),
};

export const easyItalic = {
    surroundElement: document.createElement("i"),
    matcher: matchTagName("i"),
};

export const easyUnderline = {
    surroundElement: document.createElement("u"),
    matcher: matchTagName("u"),
};

export function p(body: string): HTMLBodyElement {
    const parsed = createDocument(body);

    return parsed.body;
}

export function t(data: string): Text {
    return document.createTextNode(data);
}

function element(tagName: string): (...childNodes: Node[]) => Element {
    return function(...childNodes: Node[]): Element {
        const element = document.createElement(tagName);
        element.append(...childNodes);
        return element;
    };
} 

export const b = element("b");
export const i = element("i");
export const u = element("u");
export const span = element("span");
export const div = element("div");
