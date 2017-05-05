/**
 * @author abelnation / http://github.com/abelnation
 * @author Mugen87 / http://github.com/Mugen87
 */

import { Object3D } from '../core/Object3D';
import { Vector3 } from '../math/Vector3';
import { LineSegments } from '../objects/LineSegments';
import { LineBasicMaterial } from '../materials/LineBasicMaterial';
import { Uint16BufferAttribute, Float32BufferAttribute } from '../core/BufferAttribute';
import { BufferGeometry } from '../core/BufferGeometry';

function RectAreaLightHelper( light ) {

	Object3D.call( this );

	this.light = light;
	this.light.updateMatrixWorld();

	this.matrix = light.matrixWorld;
	this.matrixAutoUpdate = false;

	var geometry = new BufferGeometry();
	geometry.setIndex( new Uint16BufferAttribute( [ 0, 1, 1, 2, 2, 3, 3, 0, 0, 2, 1, 3 ], 1 ) );
	geometry.addAttribute( 'position', new Float32BufferAttribute( 12, 3 ) );
	
	var material = new LineBasicMaterial( { fog: false } );
	
	this.add( new LineSegments( geometry, material ) );

	geometry = new BufferGeometry();
	geometry.addAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 0, 0, 1 ], 3 ) );

	this.add( new LineSegments( geometry, material ));

	this.update();

}

RectAreaLightHelper.prototype = Object.create( Object3D.prototype );
RectAreaLightHelper.prototype.constructor = RectAreaLightHelper;

RectAreaLightHelper.prototype.dispose = function () {

	this.children[ 0 ].geometry.dispose();
	this.children[ 0 ].material.dispose();
	this.children[ 1 ].geometry.dispose();
	this.children[ 1 ].material.dispose();

};

RectAreaLightHelper.prototype.update = function () {

	var v1 = new Vector3();
	var v2 = new Vector3();
	var v3 = new Vector3();

	return function update() {
		var lightPlane = this.children[ 0 ];
		var targetLine = this.children[ 1 ];
		var position = lightPlane.geometry.attributes.position;
		var array = position.array;
		var width_half = this.light.width / 2;
		var height_half = this.light.height / 2;

		array[  0 ] = -width_half; array[  1 ] = height_half; array[  2 ] = 0;
		array[  3 ] = width_half; array[  4 ] = height_half; array[  5 ] = 0;
		array[  6 ] = width_half; array[  7 ] = -height_half; array[  8 ] = 0;
		array[  9 ] = -width_half; array[ 10 ] = -height_half; array[ 11 ] = 0;
		
		position.needsUpdate = true;
		
		lightPlane.material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );

		if ( this.light.target !== undefined && this.light.target instanceof Object3D) {
		    v1.setFromMatrixPosition( this.light.matrixWorld );
		    v2.setFromMatrixPosition( this.light.target.matrixWorld );
		    v3.subVectors( v2, v1 );
		
		    lightPlane.lookAt( v3 );

		    targetLine.lookAt( v3 );
		    targetLine.scale.z = v3.length();
		
		} else {
		
		    //targetLine.scale.z = this.light.intensity;
		    
		}

	};

}();

export { RectAreaLightHelper };
