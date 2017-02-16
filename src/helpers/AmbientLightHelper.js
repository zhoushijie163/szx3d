import { Mesh } from '../objects/Mesh';
import { MeshBasicMaterial } from '../materials/MeshBasicMaterial';
import { SphereBufferGeometry } from '../geometries/SphereGeometry';

/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */

function AmbientLightHelper( light, sphereSize ) {

	this.light = light;
	this.light.updateMatrixWorld();

	var geometry = new SphereBufferGeometry( sphereSize, 6, 3 );
	var material = new MeshBasicMaterial( { wireframe: true, fog: false } );
	material.color.copy( this.light.color );

	Mesh.call( this, geometry, material );

	this.matrix = this.light.matrixWorld;
	this.matrixAutoUpdate = false;

}

AmbientLightHelper.prototype = Object.create( Mesh.prototype );
AmbientLightHelper.prototype.constructor = AmbientLightHelper;

AmbientLightHelper.prototype.dispose = function () {

	this.geometry.dispose();
	this.material.dispose();

};

AmbientLightHelper.prototype.update = function () {

	this.material.color.copy( this.light.color );

};


export { AmbientLightHelper };
