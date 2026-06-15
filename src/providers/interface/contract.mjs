// src/providers/interface/contract.mjs
//
// The provider seam's boundary is a pure JSDoc @typedef / @callback document — there is NO
// runtime schema/parse library here. Bindings normalize their vendor responses into these shapes
// inside the binding — the raw vendor shape must never escape. A binding that lacks a capability
// must throw loudly when that method is called. Conformance is by shape, not by a runtime parse.

/**
 * @typedef {object} ChatResult
 * @property {string} text          Normalized assistant text.
 * @property {object|null} usage    Token usage, or null when unavailable.
 * @property {string} model         The model id the binding used.
 * @property {string} provider      The provider id (e.g. "claude").
 */

/**
 * @typedef {object} EmbedResult
 * @property {number[][]} vectors   One vector per input, in input order.
 * @property {object|null} usage    Token usage, or null when unavailable.
 * @property {string} model         The embedding model id.
 * @property {string} provider      The provider id.
 */

/**
 * @typedef {object} Capabilities
 * @property {boolean} chat
 * @property {boolean} embed
 */

/**
 * @callback ChatFn
 * @param {object} request
 * @returns {Promise<ChatResult>}
 */

/**
 * @callback EmbedFn
 * @param {object} request
 * @returns {Promise<EmbedResult>}
 */

/**
 * @typedef {object} Provider
 * @property {string} name
 * @property {boolean} metered
 * @property {Capabilities} capabilities
 * @property {ChatFn} chat
 * @property {EmbedFn} embed
 */

export {};
