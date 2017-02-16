import { Vector2 } from '../math/Vector2';
import { EventDispatcher } from '../core/EventDispatcher';

function GameControls( object, domElement ) {
	domElement = ( domElement !== undefined ) ? domElement : document;
	// API
	this.enabled = true;
	// internals
	var scope = this;
	var STATE = { NONE: -1, FORWARDS: 0, STANDSTILL: 1, BACKWARDS: 2 };
	var state = STATE.NONE;
	var pointer = new Vector2();
	// events
	var changeEvent = { type: 'change' };
	this.update = function( delta ) {
		if ( scope.enabled === false ) return;
		if ( state === STATE.NONE ) {
			return;
		}
		var movementX = 200 * (pointer.x - domElement.offsetWidth / 2) / domElement.offsetWidth;
		var movementY = 200 * (pointer.y - domElement.offsetHeight / 2) / domElement.offsetHeight;
		if ( state === STATE.FORWARDS ) {
			object.translateZ( ( movementY - 100 ) * delta );
			object.rotateY( - movementX * delta * Math.PI / 360);
		} else if ( state === STATE.STANDSTILL ) {
			object.translateZ( movementY * delta );
			object.rotateY( - movementX * delta * Math.PI / 360);
		} else if ( state === STATE.BACKWARDS ) {
			object.translateZ( ( movementY + 100  ) * delta );
			object.rotateY( - movementX * delta * Math.PI / 360);
		}
		scope.dispatchEvent( changeEvent );
	};
	// mouse
	function onMouseDown( event ) {
		event.preventDefault();
		if ( scope.enabled === false ) return;
		if ( event.button === 0 ) {
			state = STATE.FORWARDS;
		} else if ( event.button === 1 ) {
			state = STATE.STANDSTILL;
		} else if ( event.button === 2 ) {
			state = STATE.BACKWARDS;
		}
		pointer.set( event.offsetX, event.offsetY );
		domElement.addEventListener( 'mousemove', onMouseMove, false );
		domElement.addEventListener( 'mouseup', onMouseUp, false );
		domElement.addEventListener( 'mouseout', onMouseUp, false );
		domElement.addEventListener( 'dblclick', onMouseUp, false );
	}
	function onMouseMove( event ) {
		event.preventDefault();
		if ( scope.enabled === false ) return;
		pointer.set( event.offsetX, event.offsetY );
	}
	function onMouseUp( event ) {
		event.preventDefault();
		domElement.removeEventListener( 'mousemove', onMouseMove, false );
		domElement.removeEventListener( 'mouseup', onMouseUp, false );
		domElement.removeEventListener( 'mouseout', onMouseUp, false );
		domElement.removeEventListener( 'dblclick', onMouseUp, false );
		state = STATE.NONE;
	}
	function contextmenu( event ) {
		event.preventDefault();
		event.stopPropagation();
	}
	// touch
	function touchStart( event ) {
		event.preventDefault();
		if ( scope.enabled === false ) return;
		if (event.touches.length === 1) {
			pointer.set( event.touches[ 0 ].pageX - domElement.offsetLeft, event.touches[ 0 ].pageY - domElement.offsetTop );
			state = STATE.STANDSTILL;
			domElement.addEventListener( 'touchmove', touchMove, false );
			domElement.addEventListener( 'touchend', touchEnd, false );
		}
	}	
	function touchMove( event ) {
		event.preventDefault();
		if ( scope.enabled === false ) return;
		if (event.touches.length === 1) {
			pointer.set( event.touches[ 0 ].pageX - domElement.offsetLeft, event.touches[ 0 ].pageY - domElement.offsetTop );
		}
	}
	function touchEnd( event ) {
		event.preventDefault();
		domElement.removeEventListener( 'touchmove', touchMove, false );
		domElement.removeEventListener( 'touchend', touchEnd, false );
		state = STATE.NONE;
	}
	this.dispose = function() {
		domElement.removeEventListener( 'contextmenu', contextmenu, false );
		domElement.removeEventListener( 'mousedown', onMouseDown, false );
		domElement.removeEventListener( 'mousemove', onMouseMove, false );
		domElement.removeEventListener( 'mouseup', onMouseUp, false );
		domElement.removeEventListener( 'mouseout', onMouseUp, false );
		domElement.removeEventListener( 'dblclick', onMouseUp, false );
		domElement.removeEventListener( 'touchstart', touchStart, false );
		domElement.removeEventListener( 'touchmove', touchMove, false );
		domElement.removeEventListener( 'touchend', touchEnd, false );
		state = STATE.NONE;
	};
	domElement.addEventListener( 'contextmenu', contextmenu, false );
	domElement.addEventListener( 'mousedown', onMouseDown, false );
	domElement.addEventListener( 'touchstart', touchStart, false );
};
GameControls.prototype = Object.create( EventDispatcher.prototype );
GameControls.prototype.constructor = GameControls;

export { GameControls };
