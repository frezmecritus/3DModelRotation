function VertexArray(length) {
  array = new Float32Array(length);
  objectsNameStartPositionMap = {};
  currentEnd = 0;

  this.getArray = function () {
    return array;
  }

  this.appendObject = function (objectName, vertices) {
    objectsNameStartPositionMap[objectName] = currentEnd;
    appendVertices(vertices);
    currentEnd += vertices.length;
  }

  function appendVertices(vertices) {
    try {
        array.set(vertices, currentEnd);
    } catch (e) {
        throw e;
    }
  }

  this.getObjectStartPosition = function(objectName) {
    return objectsNameStartPositionMap[objectName];
  }
}

if(typeof exports !== 'undefined') {
    module.exports = VertexArray;
}
