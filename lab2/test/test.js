"use strict";
function test() {
}
test();
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
    console.log('Ok:', message);
}
function format(message) {
    return message.replace(/#/g, '\0');
}
