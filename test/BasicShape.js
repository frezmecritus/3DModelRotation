var chai = require('chai');
var assert = chai.assert;
var BasicShape = require("../src/BasicShape.js");

describe('BasicShape', function() {
    var floatsPerVertex = 3;
    
    describe('Brick', function() {
        var impl = new BasicShape.Brick();
        
        describe('getVertices', function() {
            it('should return a Float32Array with 72 elements', function() {
                var array = impl.getVertices();
                assert.instanceOf(array, Float32Array); 
                assert.equal(72, array.length);
            });
        });

        describe('getNormalVectors', function() {
            it('should return a Float32Array with 72 elements', function() {
                var array = impl.getNormalVectors();
                assert.instanceOf(array, Float32Array); 
                assert.equal(72, array.length);
            });
        });

        describe('getVerticesIndices', function() {
            it('should return a Uint8Array with 36 elements', function() {
                var array = impl.getVerticesIndices();
                assert.instanceOf(array, Uint8Array); 
                assert.equal(36, array.length);
            });
        });
    });

    describe('HelicopterBody', function() {
        var impl = new BasicShape.HelicopterBody();
        
        describe('getVertices', function() {
            it('should return a Float32Array with 90 elements', function() {
                var array = impl.getVertices();
                assert.instanceOf(array, Float32Array); 
                assert.equal(90, array.length);
            });
        });

        describe('getNormalVectors', function() {
            it('should return a Float32Array with 90 elements', function() {
                var array = impl.getNormalVectors();
                assert.instanceOf(array, Float32Array); 
                assert.equal(90, array.length);
            });
        });

        describe('getVerticesIndices', function() {
            it('should return a Uint8Array with 48 elements', function() {
                var array = impl.getVerticesIndices();
                assert.instanceOf(array, Uint8Array); 
                assert.equal(48, array.length);
            });
        });
    });

    describe('Sphere', function() {
        var impl = new BasicShape.Sphere();
        var numberOfDivision = 13;
        var numberOfVertices = (numberOfDivision+1)*(numberOfDivision+1)*floatsPerVertex;
        var numberOfIndices = numberOfDivision*numberOfDivision*6; 
        
        describe('getVertices', function() {
            it('should return a Float32Array with correct elements', function() {
                var array = impl.getVertices();
                assert.instanceOf(array, Float32Array); 
                assert.equal(numberOfVertices, array.length);
            });
        });

        describe('getNormalVectors', function() {
            it('should return a Float32Array with correct elements', function() {
                var array = impl.getNormalVectors();
                assert.instanceOf(array, Float32Array); 
                assert.equal(numberOfVertices, array.length);
            });
        });

        describe('getVerticesIndices', function() {
            it('should return a Uint8Array with correct elements', function() {
                var array = impl.getVerticesIndices();
                assert.instanceOf(array, Uint8Array); 
                assert.equal(numberOfIndices, array.length);
            });
        });
    });

    describe('Sphere', function() {
        var impl = new BasicShape.Sphere();
        var numberOfCapVertices = 32;
        var numberOfVertices = (6*numberOfCapVertices + 4)*floatsPerVertex; // 2v+1 + 2v+2 + 2v+1
        
        describe('getVertices', function() {
            it('should return a Float32Array with correct elements', function() {
                var array = impl.getVertices();
                assert.instanceOf(array, Float32Array); 
                assert.equal(numberOfVertices, array.length);
            });
        });

        describe('getNormalVectors', function() {
            it('should return a Float32Array with correct elements', function() {
                var array = impl.getNormalVectors();
                assert.instanceOf(array, Float32Array); 
                assert.equal(numberOfVertices, array.length);
            });
        });

        describe('getVerticesIndices', function() {
            it('is not a function', function() {
                assert.isNotFunction(impl.getVerticesIndices());
            });
        });
    });
});