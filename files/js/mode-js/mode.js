

var MODE = {
    VERSION: 'Alpha'
};

MODE.vertexNeighbors = function(geometry) {
    return this.get(geometry);
}


MODE.groundReflections = function (mesh, scene){
            geometry=mesh.geometry;
            material=mesh.material;
            geometry.computeBoundingBox();
            geometry.computeVertexNormals();

            reflectedMaterial = material.clone();
            reflectedMaterial.side = THREE.BackSide;
            reflectMesh = new THREE.Mesh(geometry, reflectedMaterial);
            reflectedGroup = new THREE.Object3D();
            reflectedGroup.add(reflectMesh);


            var mS = (new THREE.Matrix4()).identity();
            //set -1 to the corresponding axis
            // mS.elements[0] = -1;
            mS.elements[5] = -1;
            // mS.elements[10] = -1;

            reflectedGroup.applyMatrix(mS);
            //mesh.applyMatrix(mS);
            //object.applyMatrix(mS);

            // reflectedGroup.rotation(.25)
            reflectMesh.geometry.computeBoundingBox();
            reflectMesh.geometry.computeVertexNormals();

            reflectMesh.geometry.verticesNeedUpdate = true;
            reflectMesh.geometry.normalsNeedUpdate = true;
            reflectMesh.geometry.computeBoundingSphere();
            reflectMesh.geometry.computeFaceNormals();
            reflectMesh.geometry.computeVertexNormals();
            reflectedGroup.translateY(-(geometry.boundingBox.min.y) * 2);

            scene.add(reflectedGroup)

            transPlane = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(10000, 10000),
                new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.5,
                    refractionRatio: 0.98,
                    reflectivity: 0.9
                })
                // new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.9, transparent: true } )
            );
            transPlane.position.y = geometry.boundingBox.min.y;
            transPlane.rotation.x = -Math.PI / 2;

            scene.add(transPlane);

}







var remap = function remap(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }

MODE.vertexNeighbors.prototype = {

    constructor: {},

    get: function(geometry) {

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        geometry.computeTangents();
        geometry.normalsNeedUpdate = true;
        geometry.tangentsNeedUpdate = true;

        this["geometry"] = geometry;
        // console.log(geometry);

        var faceIndices = ['a', 'b', 'c', 'd'];

        for (var v = 0; v < geometry.vertices.length; v++) {
            this[v] = {}; //just creating an object for each vertex
            this[v]["adjPoints"] = [];
            this[v]["adjIndices"] = [];
            this[v]["adjColors"] = [];
            this[v]["adjNormals"] = [];
            this[v]["adjTangents"] = [];
            this[v]["adjFaces"] = [];
            this[v]["adjFaceIndex"] = [];
            this[v]["color"];
            this[v]["normal"];
            this[v]["tangent"];
            this[v]["point"];
            this[v]["index"];
        }

        for (var i = 0; i < geometry.faces.length; i++) {
            var face = geometry.faces[i];
            var vertsPerFace = (face instanceof THREE.Face3) ? 3 : 4; //is the face a quad or a tri?

            for (var j = 0; j < vertsPerFace; j++) {

                // if (this[vertexIndex].indexOf(this) == (-1)) {
                var vertexIndex = face[faceIndices[j]];

                this[vertexIndex]["adjFaces"].push(face);
                this[vertexIndex]["adjFaceIndex"].push(i);
                
                if (this[vertexIndex]["point"] == undefined) { //test if already in object to avoid redundant calcs
                    var tempColor = face.vertexColors[j];
                    var tempNorm = face.vertexNormals[j];
                    var tempTan = face.vertexTangents[j];
                    this[vertexIndex]["point"] = geometry.vertices[vertexIndex];
                    this[vertexIndex]["color"] = tempColor;
                    this[vertexIndex]["normal"] = tempNorm;
                    this[vertexIndex]["tangent"] = tempTan;
                    this[vertexIndex]["index"] = vertexIndex;
                    

                }

                for (k = 1; k < vertsPerFace; k++) { //for loop to add remaining vertices
                    if (this[vertexIndex]["adjIndices"].indexOf(face[faceIndices[(k + j) % vertsPerFace]]) == (-1)) { //test if index is already in object to avoid duplicates
                        var indexTemp = this[vertexIndex]["adjIndices"].push(face[faceIndices[(k + j) % vertsPerFace]]) //iterate through other vertices on face to add to list
                        this[vertexIndex]["adjPoints"].push(geometry.vertices[indexTemp]) //same with adjPoints
                        this[vertexIndex]["adjColors"].push(face.vertexColors[(k + j) % vertsPerFace]) //same with adjColors
                        this[vertexIndex]["adjNormals"].push(face.vertexNormals[(k + j) % vertsPerFace]) //same with adjNormals
                        this[vertexIndex]["adjTangents"].push(face.vertexTangents[(k + j) % vertsPerFace]) //same with adjTangents
                    }
                }
            }
        }
        return this;
    },

    colorAtIndex: function(index) {
        return this[index]["color"];
    },
    pointAtIndex: function(index) {
        return this[index]["point"];
    },
    normalAtIndex: function(index) {
        return this[index]["normal"];
    },
    tangentAtIndex: function(index) {
        return this[index]["tangent"];
    },

    adjColorsAtIndex: function(index) {
        return this[index]["adjColors"];
    },
    adjIndicesAtIndex: function(index) {
        return this[index]["adjIndices"];
    },
    adjPointsAtIndex: function(index) {
        return this[index]["adjPoints"];
    },
    adjNormalsAtIndex: function(index) {
        return this[index]["adjNormals"];
    },
    adjTangentsAtIndex: function(index) {
        return this[index]["adjTangents"];
    },

    setFaceVertexColors: function(colorList) {

        faceLength = this.geometry.faces.length;
        var faceIndices = ['a', 'b', 'c', 'd'];

        for (var i = 0; i < faceLength; i++) {
            var face = this.geometry.faces[i];
            var vertsPerFace = (face instanceof THREE.Face3) ? 3 : 4; //is the face a quad or a tri?
            for (var j = 0; j < vertsPerFace; j++) {
                var vertexIndex = face[faceIndices[j]];

                if (colorList == undefined) {
                    face.vertexColors[j] = this[vertexIndex]["color"];
                } else {
                    face.vertexColors[j] = colorList[vertexIndex];
                }
            }
        }
        // console.log(this);
        this.geometry.colorsNeedUpdate=true;
        return this;
    },

    meshBlur: function(iterations, colorList) {
        for (z = 0; z < iterations; z++) {
            tempCols = [];
            for (var v = 0; v < this.geometry.vertices.length; v++) {
                if (z == 0) {
                    var vColor = this[v]["color"].clone();
                } else {
                    var vColor = this[v]["blurColor"].clone();
                }

                var colLength = this[v]["adjColors"].length;
                for (var t = 0; t < colLength; t++) {
                    if (z == 0) {
                        vColor = vColor.lerp(this[this[v]["adjIndices"][t]]["color"], 1 / colLength);
                    } else {
                        vColor = vColor.lerp(this[this[v]["adjIndices"][t]]["blurColor"], 1 / colLength);
                    }
                }
                tempCols.push(vColor);
            }
            for (var v = 0; v < tempCols.length; v++) {
                this[v]["blurColor"] = tempCols[v];
            }
        }
        tempCols = [];
        for (var v = 0; v < this.geometry.vertices.length; v++) {
            if (iterations != 0) {
                tempCols.push(this[v]["blurColor"]);
            } else {
                tempCols.push(this[v]["color"]);
            }
        }
        this.setFaceVertexColors(tempCols);
        return this;
    }
};
