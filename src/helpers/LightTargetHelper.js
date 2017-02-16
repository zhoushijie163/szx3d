import { Color } from '../math/Color';
import { LineSegments } from '../objects/LineSegments';
import { LineBasicMaterial } from '../materials/LineBasicMaterial';
import { BufferAttribute } from '../core/BufferAttribute';
import { BufferGeometry } from '../core/BufferGeometry';
import { Object3D } from '../core/Object3D';

function LightTargetHelper( light, size ) {

	this.light = light;
	this.target = (function () { 
		if (light.target === undefined) {
			var target = new Object3D();
			target.position.setFromMatrixPosition( light.matrixWorld );
			return target;
		} else {
			return light.target;
		}
	})();
	this.target.updateMatrixWorld();
    
	var color = new Color();
	if (light.intensity === undefined) {
		color.copy( light.color );
	} else {
		color.copy( light.color ).multiplyScalar( light.intensity );
	}
	
	if ( typeof size !== "number" || size === 0 ) size = 1;
    size = size / 2;
	var indices = new Uint16Array( [ 0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7 ] );
	var positions = new Float32Array( [ size, size, size, -size, size, size, -size, -size, size, size, -size, size, size, size, -size, -size, size, -size, -size, -size, -size, size, -size, -size ] );

	var geometry = new BufferGeometry();
	geometry.setIndex( new BufferAttribute( indices, 1 ) );
	geometry.addAttribute( 'position', new BufferAttribute( positions, 3 ) );

	LineSegments.call( this, geometry, new LineBasicMaterial( { color: color } ) );
	this.matrix = this.target.matrixWorld;
	this.matrixAutoUpdate = false;

	this.update( );

}

LightTargetHelper.prototype = Object.create( LineSegments.prototype );
LightTargetHelper.prototype.constructor = LightTargetHelper;

LightTargetHelper.prototype.dispose = function () {

	this.geometry.dispose();
	this.material.dispose();

};

LightTargetHelper.prototype.update =  function () {

	if (this.light.intensity === undefined) {
		this.material.color.copy( this.light.color );
	} else {
		this.material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );
	}
    
};

export { LightTargetHelper };
