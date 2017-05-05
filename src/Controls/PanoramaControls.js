import { Vector3 } from '../math/Vector3';
import { Matrix3 } from '../math/Matrix3';
import { Vector2 } from '../math/Vector2';
import { Spherical } from '../math/Spherical';
import { EventDispatcher } from '../core/EventDispatcher';

function PanoramaControls( object, domElement ) {
	
    domElement = ( domElement !== undefined ) ? domElement : document;
 
 	// API
 	
	this.enabled = true;
	this.center = new Vector3();
	this.zoomSpeed = 0.001;
	this.rotationSpeed = 0.001;
	this.isSceneBackground = false;

	// internals

	var scope = this;
	var vector = new Vector3();

	var STATE = { NONE: - 1, ROTATE: 0, ZOOM: 1 };
	var state = STATE.NONE;

	var normalMatrix = new Matrix3();
	var pointer = new Vector2();
	var pointerOld = new Vector2();
	var spherical = new Spherical();

	// events

	var changeEvent = { type: 'change' };

	this.focus = function ( ) {

		object.lookAt( scope.center.clone() );
		scope.dispatchEvent( changeEvent );

	};

	this.zoom = function ( delta ) {

		if (object.isPerspectiveCamera && this.isSceneBackground ) {
			delta.multiplyScalar( object.getFocalLength() * scope.zoomSpeed );
			
			var distance = object.getFocalLength() - delta.z;
			
			if (distance < 8 && delta.z > 0) return;

			object.setFocalLength(object.getFocalLength() - delta.z);

		} else {
			var distance = object.position.distanceTo( scope.center );

			delta.multiplyScalar( distance * scope.zoomSpeed );

			if ( delta.length() > distance ) return;
		
			delta.applyMatrix3( normalMatrix.getNormalMatrix( object.matrix ) );

			object.position.add( delta );
		}
		scope.dispatchEvent( changeEvent );

	};

	this.rotate = function ( delta ) {

		vector.copy( object.position ).sub( scope.center );

		spherical.setFromVector3( vector );

		spherical.theta += delta.x;
		spherical.phi += delta.y;

		spherical.makeSafe();

		vector.setFromSpherical( spherical );

		object.position.copy( scope.center ).add( vector );

		object.lookAt( scope.center );

		scope.dispatchEvent( changeEvent );

	};

	// mouse

	function onMouseDown( event ) {

		if ( scope.enabled === false ) return;

		if ( event.button === 0 ) {

			state = STATE.ROTATE;

		} else if ( event.button === 1 ) {

			state = STATE.ZOOM;

		}

		pointerOld.set( event.clientX, event.clientY );

		domElement.addEventListener( 'mousemove', onMouseMove, false );
		domElement.addEventListener( 'mouseup', onMouseUp, false );
		domElement.addEventListener( 'mouseout', onMouseUp, false );
		domElement.addEventListener( 'dblclick', onMouseUp, false );

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		pointer.set( event.clientX, event.clientY );

		var movementX = pointer.x - pointerOld.x;
		var movementY = pointer.y - pointerOld.y;

		if ( state === STATE.ROTATE ) {

			scope.rotate( new Vector3( movementX * scope.rotationSpeed, movementY * scope.rotationSpeed, 0 ) );

		} else if ( state === STATE.ZOOM ) {

			scope.zoom( new Vector3( 0, 0, movementY ) );

		}

		pointerOld.set( event.clientX, event.clientY );

	}

	function onMouseUp( event ) {

		domElement.removeEventListener( 'mousemove', onMouseMove, false );
		domElement.removeEventListener( 'mouseup', onMouseUp, false );
		domElement.removeEventListener( 'mouseout', onMouseUp, false );
		domElement.removeEventListener( 'dblclick', onMouseUp, false );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		event.preventDefault();

		if ( scope.enabled === false ) return;

		scope.zoom( new Vector3( 0, 0, event.deltaY ) );

	}

	function contextmenu( event ) {

		event.preventDefault();

	}

	// touch

	var touch = new Vector3();

	var touches = [ new Vector3(), new Vector3(), new Vector3() ];
	var prevTouches = [ new Vector3(), new Vector3(), new Vector3() ];

	var prevDistance = null;

	function touchStart( event ) {

		if ( scope.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:
				touches[ 0 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 );
				touches[ 1 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 );
				break;

			case 2:
				touches[ 0 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 );
				touches[ 1 ].set( event.touches[ 1 ].pageX, event.touches[ 1 ].pageY, 0 );
				prevDistance = touches[ 0 ].distanceTo( touches[ 1 ] );
				break;

		}

		prevTouches[ 0 ].copy( touches[ 0 ] );
		prevTouches[ 1 ].copy( touches[ 1 ] );

	}


	function touchMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		function getClosest( touch, touches ) {

			var closest = touches[ 0 ];

			for ( var i in touches ) {

				if ( closest.distanceTo( touch ) > touches[ i ].distanceTo( touch ) ) closest = touches[ i ];

			}

			return closest;

		}

		switch ( event.touches.length ) {

			case 1:
				touches[ 0 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 );
				touches[ 1 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 );
				scope.rotate( touches[ 0 ].sub( getClosest( touches[ 0 ], prevTouches ) ).multiplyScalar( scope.rotationSpeed ) );
				break;

			case 2:
				touches[ 0 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 );
				touches[ 1 ].set( event.touches[ 1 ].pageX, event.touches[ 1 ].pageY, 0 );
				var distance = touches[ 0 ].distanceTo( touches[ 1 ] );
				scope.zoom( new Vector3( 0, 0, prevDistance - distance ) );
				prevDistance = distance;


				var offset0 = touches[ 0 ].clone().sub( getClosest( touches[ 0 ], prevTouches ) ).multiplyScalar( scope.rotationSpeed );
				var offset1 = touches[ 1 ].clone().sub( getClosest( touches[ 1 ], prevTouches ) ).multiplyScalar( scope.rotationSpeed );
				//offset0.y = - offset0.y;
				//offset1.y = - offset1.y;

				scope.rotate( offset0.add( offset1 ).multiplyScalar( 0.5 ) );

				break;

		}

		prevTouches[ 0 ].copy( touches[ 0 ] );
		prevTouches[ 1 ].copy( touches[ 1 ] );

	}

	this.dispose = function() {

		domElement.removeEventListener( 'contextmenu', contextmenu, false );
		domElement.removeEventListener( 'mousedown', onMouseDown, false );
		domElement.removeEventListener( 'wheel', onMouseWheel, false );

		domElement.removeEventListener( 'mousemove', onMouseMove, false );
		domElement.removeEventListener( 'mouseup', onMouseUp, false );
		domElement.removeEventListener( 'mouseout', onMouseUp, false );
		domElement.removeEventListener( 'dblclick', onMouseUp, false );

		domElement.removeEventListener( 'touchstart', touchStart, false );
		domElement.removeEventListener( 'touchmove', touchMove, false );

	};

	domElement.addEventListener( 'contextmenu', contextmenu, false );
	domElement.addEventListener( 'mousedown', onMouseDown, false );
	domElement.addEventListener( 'wheel', onMouseWheel, false );

	domElement.addEventListener( 'touchstart', touchStart, false );
	domElement.addEventListener( 'touchmove', touchMove, false );

}

PanoramaControls.prototype = Object.create( EventDispatcher.prototype );
PanoramaControls.prototype.constructor = PanoramaControls;

export { PanoramaControls };
