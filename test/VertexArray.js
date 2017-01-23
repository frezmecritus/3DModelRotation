var chai = require('chai');
var assert = chai.assert;
var VertexArray = require("../src/VertexArray");

var brickVertices = new Float32Array([
   1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
   1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
   1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
  -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
  -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
   1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
]);

describe('VertexArray', function() {
  var impl = new VertexArray(brickVertices.length);

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
