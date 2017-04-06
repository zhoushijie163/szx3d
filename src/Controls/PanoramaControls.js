import { Vector3 } from '../math/Vector3';
import { EventDispatcher } from '../core/EventDispatcher';

function PanoramaControls( object, domElement ) {
	
    domElement = ( domElement !== undefined ) ? domElement : document;
 
 	// API
 	
	this.enabled = true;
	this.center = new Vector3();
	this.zoomSpeed = 0.001;
	this.rotationSpeed = 0.005;

	// internals

	var scope = this;
	var vector = new Vector3();

}

PanoramaControls.prototype = Object.create( EventDispatcher.prototype );
PanoramaControls.prototype.constructor = PanoramaControls;

export { PanoramaControls };
