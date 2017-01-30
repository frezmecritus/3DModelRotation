var chai = require('chai');
var assert = chai.assert;
var ArrayBuffer = require("../src/ArrayBuffer.js");
var BasicShape = require("../src/BasicShape.js");

describe('ArrayBufferFloat32', function() {
    var brick = new BasicShape.Brick();
    var brickVertices = brick.getVertices();
    var impl = new ArrayBuffer.ArrayBufferFloat32Array(brickVertices.length);

    describe('#getArray', function() {
        it('should return Float32Array', function() {
            assert.instanceOf(impl.getArray(), Float32Array);
        });
    });

    describe('#getObjectStartPosition', function() {
        it('should return undefined when no object appended', function() {
            assert.isUndefined(impl.getObjectStartPosition('brick'));
        });
    });

    describe('#getObjectStartPosition', function() {
        it('should return 0 when appended brick object', function() {
            impl.appendObject('brick', brickVertices);
            assert.equal(0, impl.getObjectStartPosition('brick'));
        });
    });

    describe('#getArray', function() {
        it('should return the same value as brickVertices when access the same index', function() {
            var array = impl.getArray();
            var testIndex = 7;
            assert.strictEqual(brickVertices[7], array[7]);
        });
    });

    describe('#getObjectStartPosition', function() {
        it('should return undefined when no cylinder object appended', function() {
            assert.isUndefined(impl.getObjectStartPosition('cylinder'));
        });
    });

    describe('#getObjectStartPosition', function() {
        it('should throw RangeError when appended out of range', function() {
            assert.throws(
                function() { impl.appendObject('brick', brickVertices)},
                RangeError);
        });
    });
});
