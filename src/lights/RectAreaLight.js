import { Light } from './Light';
import { Object3D } from '../core/Object3D';
/**
 * @author abelnation / http://github.com/abelnation
 */

function RectAreaLight ( color, intensity, width, height ) {

	Light.call( this, color, intensity );

	this.type = 'RectAreaLight';

	this.position.copy( Object3D.DefaultUp );
	this.updateMatrix();

	this.width = ( width !== undefined ) ? width : 10;
	this.height = ( height !== undefined ) ? height : 10;

	// TODO (abelnation): distance/decay

	// TODO (abelnation): update method for RectAreaLight to update transform to lookat target
	//this.target = new Object3D();
	
	// TODO (abelnation): shadows
	// this.shadow = new THREE.RectAreaLightShadow( new THREE.PerspectiveCamera( 90, 1, 0.5, 500 ) );

}

// TODO (abelnation): RectAreaLight update when light shape is changed
RectAreaLight.prototype = Object.assign( Object.create( Light.prototype ), {

	constructor: RectAreaLight,

	isRectAreaLight: true,

	copy: function ( source ) {

		Light.prototype.copy.call( this, source );

		this.width = source.width;
		this.height = source.height;

		// this.shadow = source.shadow.clone();

		return this;

	},

	toJSON: function ( meta ) {

		var data = Light.prototype.toJSON.call( this, meta );

		data.object.width = this.width;
		data.object.height = this.height;

		return data;

	}

} );

export { RectAreaLight };
