import { VertexColors, DoubleSide, BackSide, MirroredRepeatWrapping, RepeatWrapping } from '../constants';
import { Color } from '../math/Color';
import { Texture } from '../textures/Texture';
import { Material } from '../materials/Material';
import { Mesh } from '../objects/Mesh';

function JSONExporter() {}

Object.assign( JSONExporter.prototype, {
     constructor: JSONExporter,
     parse: function (object) {
         if (object === undefined || !(object instanceof Mesh))
             return null;
         var geometry = object.geometry.clone();
         geometry.applyMatrix(object.matrix);
         var materials = [];
         if (Array.isArray(object.material)) {
             for (var i = 0; i < object.material.length; i++) {
                 materials.push(object.material[ i ].clone());
             }
         } else if (object.material instanceof Material) {
             materials.push(object.material.clone());
         }

         var output = {
             metadata: {
                 generatedBy: 'JSONExporter',
                 formatVersion: 3.1,
                 materials: materials.length,
                 vertices: geometry.vertices.length,
                 normals: 0,
                 colors: 0,
                 uvs: 0,
                 triangles: geometry.faces.length
             },
             vertices: [],
             faces: []
         };

         var normals = [];
         var normalsHash = {};
         var colors = [];
         var colorsHash = {};
         var uvs = [];
         var uvsHash = {};

         if (materials.length > 0)
             output.materials = [];

         function dumpColor(color) {
             if (!!color && color instanceof Color) {
                 return [color.r, color.g, color.b];
             }
         }

         function getDataURL(image) {
             var canvas;
             if (image.toDataURL !== undefined) {
                 canvas = image;
             } else {
                 canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
                 canvas.width = image.width;
                 canvas.height = image.height;
                 canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
             }
             if (canvas.width > 2048 || canvas.height > 2048) {
                 return canvas.toDataURL('image/jpeg', 0.6);
             } else {
                 return canvas.toDataURL('image/png');
             }

         }

         function dumpWarp(wrap) {
             switch (wrap) {
                 case MirroredRepeatWrapping:
                     return 'mirror';
                     break;
                 case RepeatWrapping:
                     return 'repeat';
                     break;
                 default:
                     return 'clamp';
             }
         }

         function dumpMap(m, pmap, label) {
             if (!!pmap && pmap instanceof Texture) {
                 m[label] = getDataURL(pmap.image);
                 m[label + 'Offset'] = [pmap.offset.x, pmap.offset.y];
                 m[label + 'Repeat'] = [pmap.repeat.x, pmap.repeat.y];
                 m[label + 'Wrap'] = [dumpWarp(pmap.wrapS), dumpWarp(pmap.wrapT)];
                 if (pmap.anisotropy !== 1)
                     m[label + 'Anisotropy'] = pmap.anisotropy;
                 return m;
             }
         }

         for (var i = 0; i < materials.length; i++) {
             var m = {DbgIndex: i};
             m.DbgName = materials[i].name;
             m.colorDiffuse = dumpColor(materials[i].color);
             //m.colorAmbient = dumpColor(materials[i].color);
             m.colorSpecular = dumpColor(materials[i].specular);
             m.colorEmissive = dumpColor(materials[i].emissive);
             if (materials[i].type === 'MeshStandardMaterial') {
                 m.shading = 'standard';
             } else if (materials[i].type === 'MeshPhongMaterial') {
                 m.shading = 'phong';
             }

             if (materials[i].transparent) {
                 m.transparent = true;
                 m.opacity = materials[i].opacity;
             }
             if (materials[i].visible === false)
                 m.visible = false;

             if (materials[i].shininess !== undefined)
                 m.specularCoef = materials[i].shininess;
             if (materials[i].side === DoubleSide)
                 m.doubleSided = true;
             else if (materials[i].side === BackSide)
                 m.flipSided = true;

             dumpMap(m, materials[i].map, 'mapDiffuse');
             dumpMap(m, materials[i].emissiveMap, 'mapEmissive');
             dumpMap(m, materials[i].lightMap, 'mapLight');
             dumpMap(m, materials[i].aoMap, 'mapAO');
             dumpMap(m, materials[i].bumpMap, 'mapBump');
             if (materials[i].bumpScale !== undefined)
                 m.mapBumpScale = materials[i].bumpScale;
             dumpMap(m, materials[i].normalMap, 'mapNormal');
             if (materials[i].normalScale !== undefined && materials[i].normalScale.x !== 1)
                 m.mapNormalFactor = materials[i].normalScale.x;
             dumpMap(m, materials[i].specularMap, 'mapSpecular');
             dumpMap(m, materials[i].metalnessMap, 'mapMetalness');
             dumpMap(m, materials[i].roughnessMap, 'mapRoughness');
             dumpMap(m, materials[i].alphaMap, 'mapAlpha');
             //dumpMap(m, materials[i].map, 'mapAmbient');
             dumpMap(m, materials[i].displacementMap, 'mapDisplacement');

             m.vertexColors = (materials[i].vertexColors === VertexColors);
             output.materials.push(m);
         }

         for (var i = 0; i < geometry.vertices.length; i++) {
             output.vertices.push(geometry.vertices[ i ].x, geometry.vertices[ i ].y, geometry.vertices[ i ].z);
         }

         function setBit(value, position, enabled) {
             return enabled ? value | (1 << position) : value & (~(1 << position));
         }

         function getUvIndex(uv) {
             var hash = uv.x.toString() + '_' + uv.y.toString();
             if (uvsHash[ hash ] !== undefined) {
                 return uvsHash[ hash ];
             }
             uvsHash[ hash ] = output.metadata.uvs++;						// uvs.length / 2;
             uvs.push(uv.x, uv.y);
             return uvsHash[ hash ];
         }

         function getNormalIndex(normal) {
             var hash = normal.x.toString() + '_' + normal.y.toString() + '_' + normal.z.toString();
             if (normalsHash[ hash ] !== undefined) {
                 return normalsHash[ hash ];
             }
             normalsHash[ hash ] = output.metadata.normals++;				//normals.length / 3;
             normals.push(normal.x, normal.y, normal.z);
             return normalsHash[ hash ];
         }

         function getColorIndex(color) {
             var hash = color.r.toString() + '_' + color.g.toString() + '_' + color.b.toString();
             if (colorsHash[ hash ] !== undefined) {
                 return colorsHash[ hash ];
             }
             colorsHash[ hash ] = output.metadata.colors++;					//colors.length;
             colors.push(color.getHex());
             return colorsHash[ hash ];
         }

         for (var i = 0; i < geometry.faces.length; i++) {
             var face = geometry.faces[ i ];

             var hasMaterial = materials.length > 0;
             var hasFaceUv = false; // deprecated
             var hasFaceVertexUv = geometry.faceVertexUvs[ 0 ][ i ] !== undefined;
             var hasFaceNormal = face.normal.length() > 0;
             var hasFaceVertexNormal = face.vertexNormals.length > 0;
             var hasFaceColor = face.color.r !== 1 || face.color.g !== 1 || face.color.b !== 1;
             var hasFaceVertexColor = face.vertexColors.length > 0;

             var faceType = 0;
             faceType = setBit(faceType, 0, false);
             faceType = setBit(faceType, 1, hasMaterial);
             faceType = setBit(faceType, 2, hasFaceUv);
             faceType = setBit(faceType, 3, hasFaceVertexUv);
             faceType = setBit(faceType, 4, hasFaceNormal);
             faceType = setBit(faceType, 5, hasFaceVertexNormal);
             faceType = setBit(faceType, 6, hasFaceColor);
             faceType = setBit(faceType, 7, hasFaceVertexColor);

             output.faces.push(faceType);
             output.faces.push(face.a, face.b, face.c);

             if (hasMaterial) {
                 output.faces.push(face.materialIndex);
             }

             if (hasFaceVertexUv) {
                 var faceVertexUvs = geometry.faceVertexUvs[ 0 ][ i ];
                 output.faces.push(getUvIndex(faceVertexUvs[ 0 ]), getUvIndex(faceVertexUvs[ 1 ]), getUvIndex(faceVertexUvs[ 2 ]));
             }

             if (hasFaceNormal) {
                 output.faces.push(getNormalIndex(face.normal));
             }
             if (hasFaceVertexNormal) {
                 var vertexNormals = face.vertexNormals;
                 output.faces.push(getNormalIndex(vertexNormals[ 0 ]), getNormalIndex(vertexNormals[ 1 ]), getNormalIndex(vertexNormals[ 2 ]));
             }

             if (hasFaceColor) {
                 output.faces.push(getColorIndex(face.color));
             }
             if (hasFaceVertexColor) {
                 var vertexColors = face.vertexColors;
                 output.faces.push(getColorIndex(vertexColors[ 0 ]), getColorIndex(vertexColors[ 1 ]), getColorIndex(vertexColors[ 2 ]));
             }
         }
         output.normals = normals;
         if (colors.length > 0)
             output.colors = colors;
         if (uvs.length > 0)
             output.uvs = [uvs];
         return JSON.stringify(output);
     }
 });

export { JSONExporter };

