import { DoubleSide } from '../../constants';
import { GizmoMaterial, GizmoLineMaterial } from './GizmoMaterial';
import { Object3D } from '../../core/Object3D';
import { PlaneBufferGeometry } from '../../geometries/PlaneGeometry';
import { MeshBasicMaterial } from '../../materials/MeshBasicMaterial';
import { Mesh } from '../../objects/Mesh';
import { Vector3 } from '../../math/Vector3';
import { Matrix4 } from '../../math/Matrix4';
import { Geometry } from '../../core/Geometry';
import { CylinderGeometry, CylinderBufferGeometry } from '../../geometries/CylinderGeometry';
import { BufferGeometry } from '../../core/BufferGeometry';
import { Float32BufferAttribute } from '../../core/BufferAttribute';
import { Line } from '../../objects/Line';
import { OctahedronGeometry } from '../../geometries/OctahedronGeometry';
import { TorusBufferGeometry } from '../../geometries/TorusGeometry';
import { Euler } from '../../math/Euler';
import { Quaternion } from '../../math/Quaternion';
import { BoxGeometry, BoxBufferGeometry } from '../../geometries/BoxGeometry';

var pickerMaterial = new GizmoMaterial( { visible: false, transparent: false } );

function TransformGizmo() {

	var scope = this;

	this.init = function () {

		Object3D.call( this );

		this.handles = new Object3D();
		this.pickers = new Object3D();
		this.planes = new Object3D();

		this.add( this.handles );
		this.add( this.pickers );
		this.add( this.planes );

		//// PLANES

		var planeGeometry = new PlaneBufferGeometry( 50, 50, 2, 2 );
		var planeMaterial = new MeshBasicMaterial( { visible: false, side: DoubleSide } );

		var planes = {
			"XY":   new Mesh( planeGeometry, planeMaterial ),
			"YZ":   new Mesh( planeGeometry, planeMaterial ),
			"XZ":   new Mesh( planeGeometry, planeMaterial ),
			"XYZE": new Mesh( planeGeometry, planeMaterial )
		};

		this.activePlane = planes[ "XYZE" ];

		planes[ "YZ" ].rotation.set( 0, Math.PI / 2, 0 );
		planes[ "XZ" ].rotation.set( - Math.PI / 2, 0, 0 );

		for ( var i in planes ) {

			planes[ i ].name = i;
			this.planes.add( planes[ i ] );
			this.planes[ i ] = planes[ i ];

		}

		//// HANDLES AND PICKERS

		var setupGizmos = function( gizmoMap, parent ) {

			for ( var name in gizmoMap ) {

				for ( i = gizmoMap[ name ].length; i --; ) {

					var object = gizmoMap[ name ][ i ][ 0 ];
					var position = gizmoMap[ name ][ i ][ 1 ];
					var rotation = gizmoMap[ name ][ i ][ 2 ];

					object.name = name;

					if ( position ) object.position.set( position[ 0 ], position[ 1 ], position[ 2 ] );
					if ( rotation ) object.rotation.set( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ] );

					parent.add( object );

				}

			}

		};

		setupGizmos( this.handleGizmos, this.handles );
		setupGizmos( this.pickerGizmos, this.pickers );

		// reset Transformations

		this.traverse( function ( child ) {

			if ( child instanceof Mesh ) {

				child.updateMatrix();

				var tempGeometry = child.geometry.clone();
				tempGeometry.applyMatrix( child.matrix );
				child.geometry = tempGeometry;

				child.position.set( 0, 0, 0 );
				child.rotation.set( 0, 0, 0 );
				child.scale.set( 1, 1, 1 );

			}

		} );

	};

	this.highlight = function ( axis ) {

		this.traverse( function( child ) {

			if ( child.material && child.material.highlight ) {

				if ( child.name === axis ) {

					child.material.highlight( true );

				} else {

					child.material.highlight( false );

				}

			}

		} );

	};

};

TransformGizmo.prototype = Object.create( Object3D.prototype );
TransformGizmo.prototype.constructor = TransformGizmo;

TransformGizmo.prototype.update = function ( rotation, eye ) {

	var vec1 = new Vector3( 0, 0, 0 );
	var vec2 = new Vector3( 0, 1, 0 );
	var lookAtMatrix = new Matrix4();

	this.traverse( function( child ) {

		if ( child.name.search( "E" ) !== - 1 ) {

			child.quaternion.setFromRotationMatrix( lookAtMatrix.lookAt( eye, vec1, vec2 ) );

		} else if ( child.name.search( "X" ) !== - 1 || child.name.search( "Y" ) !== - 1 || child.name.search( "Z" ) !== - 1 ) {

			child.quaternion.setFromEuler( rotation );

		}

	} );

};

function TransformGizmoTranslate() {

	TransformGizmo.call( this );

	var arrowGeometry = new Geometry();
	var mesh = new Mesh( new CylinderGeometry( 0, 0.05, 0.2, 12, 1, false ) );
	mesh.position.y = 0.5;
	mesh.updateMatrix();

	arrowGeometry.merge( mesh.geometry, mesh.matrix );

	var lineXGeometry = new BufferGeometry();
	lineXGeometry.addAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0,  1, 0, 0 ], 3 ) );

	var lineYGeometry = new BufferGeometry();
	lineYGeometry.addAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0,  0, 1, 0 ], 3 ) );

	var lineZGeometry = new BufferGeometry();
	lineZGeometry.addAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0,  0, 0, 1 ], 3 ) );

	this.handleGizmos = {

		X: [
			[ new Mesh( arrowGeometry, new GizmoMaterial( { color: 0xff0000 } ) ), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ],
			[ new Line( lineXGeometry, new GizmoLineMaterial( { color: 0xff0000 } ) ) ]
		],

		Y: [
			[ new Mesh( arrowGeometry, new GizmoMaterial( { color: 0x00ff00 } ) ), [ 0, 0.5, 0 ] ],
			[ new Line( lineYGeometry, new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
		],

		Z: [
			[ new Mesh( arrowGeometry, new GizmoMaterial( { color: 0x0000ff } ) ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ] ],
			[ new Line( lineZGeometry, new GizmoLineMaterial( { color: 0x0000ff } ) ) ]
		],

		XYZ: [
			[ new Mesh( new OctahedronGeometry( 0.1, 0 ), new GizmoMaterial( { color: 0xffffff, opacity: 0.25 } ) ), [ 0, 0, 0 ], [ 0, 0, 0 ] ]
		],

		XY: [
			[ new Mesh( new PlaneBufferGeometry( 0.29, 0.29 ), new GizmoMaterial( { color: 0xffff00, opacity: 0.25 } ) ), [ 0.15, 0.15, 0 ] ]
		],

		YZ: [
			[ new Mesh( new PlaneBufferGeometry( 0.29, 0.29 ), new GizmoMaterial( { color: 0x00ffff, opacity: 0.25 } ) ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ] ]
		],

		XZ: [
			[ new Mesh( new PlaneBufferGeometry( 0.29, 0.29 ), new GizmoMaterial( { color: 0xff00ff, opacity: 0.25 } ) ), [ 0.15, 0, 0.15 ], [ - Math.PI / 2, 0, 0 ] ]
		]

	};

	this.pickerGizmos = {

		X: [
			[ new Mesh( new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0.6, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
		],

		Y: [
			[ new Mesh( new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0.6, 0 ] ]
		],

		Z: [
			[ new Mesh( new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ] ]
		],

		XYZ: [
			[ new Mesh( new OctahedronGeometry( 0.2, 0 ), pickerMaterial ) ]
		],

		XY: [
			[ new Mesh( new PlaneBufferGeometry( 0.4, 0.4 ), pickerMaterial ), [ 0.2, 0.2, 0 ] ]
		],

		YZ: [
			[ new Mesh( new PlaneBufferGeometry( 0.4, 0.4 ), pickerMaterial ), [ 0, 0.2, 0.2 ], [ 0, Math.PI / 2, 0 ] ]
		],

		XZ: [
			[ new Mesh( new PlaneBufferGeometry( 0.4, 0.4 ), pickerMaterial ), [ 0.2, 0, 0.2 ], [ - Math.PI / 2, 0, 0 ] ]
		]

	};

	this.setActivePlane = function ( axis, eye ) {

		var tempMatrix = new Matrix4();
		eye.applyMatrix4( tempMatrix.getInverse( tempMatrix.extractRotation( this.planes[ "XY" ].matrixWorld ) ) );

		if ( axis === "X" ) {

			this.activePlane = this.planes[ "XY" ];

			if ( Math.abs( eye.y ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "XZ" ];

		}

		if ( axis === "Y" ) {

			this.activePlane = this.planes[ "XY" ];

			if ( Math.abs( eye.x ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "YZ" ];

		}

		if ( axis === "Z" ) {

			this.activePlane = this.planes[ "XZ" ];

			if ( Math.abs( eye.x ) > Math.abs( eye.y ) ) this.activePlane = this.planes[ "YZ" ];

		}

		if ( axis === "XYZ" ) this.activePlane = this.planes[ "XYZE" ];

		if ( axis === "XY" ) this.activePlane = this.planes[ "XY" ];

		if ( axis === "YZ" ) this.activePlane = this.planes[ "YZ" ];

		if ( axis === "XZ" ) this.activePlane = this.planes[ "XZ" ];

	};

	this.init();

};

TransformGizmoTranslate.prototype = Object.create( TransformGizmo.prototype );
TransformGizmoTranslate.prototype.constructor = TransformGizmoTranslate;

function TransformGizmoRotate() {

	TransformGizmo.call( this );

	var CircleGeometry = function ( radius, facing, arc ) {

		var geometry = new BufferGeometry();
		var vertices = [];
		arc = arc ? arc : 1;

		for ( var i = 0; i <= 64 * arc; ++ i ) {

			if ( facing === 'x' ) vertices.push( 0, Math.cos( i / 32 * Math.PI ) * radius, Math.sin( i / 32 * Math.PI ) * radius );
			if ( facing === 'y' ) vertices.push( Math.cos( i / 32 * Math.PI ) * radius, 0, Math.sin( i / 32 * Math.PI ) * radius );
			if ( facing === 'z' ) vertices.push( Math.sin( i / 32 * Math.PI ) * radius, Math.cos( i / 32 * Math.PI ) * radius, 0 );

		}

		geometry.addAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		return geometry;

	};

	this.handleGizmos = {

		X: [
			[ new Line( new CircleGeometry( 1, 'x', 0.5 ), new GizmoLineMaterial( { color: 0xff0000 } ) ) ]
		],

		Y: [
			[ new Line( new CircleGeometry( 1, 'y', 0.5 ), new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
		],

		Z: [
			[ new Line( new CircleGeometry( 1, 'z', 0.5 ), new GizmoLineMaterial( { color: 0x0000ff } ) ) ]
		],

		E: [
			[ new Line( new CircleGeometry( 1.25, 'z', 1 ), new GizmoLineMaterial( { color: 0xcccc00 } ) ) ]
		],

		XYZE: [
			[ new Line( new CircleGeometry( 1, 'z', 1 ), new GizmoLineMaterial( { color: 0x787878 } ) ) ]
		]

	};

	this.pickerGizmos = {

		X: [
			[ new Mesh( new TorusBufferGeometry( 1, 0.12, 4, 12, Math.PI ), pickerMaterial ), [ 0, 0, 0 ], [ 0, - Math.PI / 2, - Math.PI / 2 ] ]
		],

		Y: [
			[ new Mesh( new TorusBufferGeometry( 1, 0.12, 4, 12, Math.PI ), pickerMaterial ), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ] ]
		],

		Z: [
			[ new Mesh( new TorusBufferGeometry( 1, 0.12, 4, 12, Math.PI ), pickerMaterial ), [ 0, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
		],

		E: [
			[ new Mesh( new TorusBufferGeometry( 1.25, 0.12, 2, 24 ), pickerMaterial ) ]
		],

		XYZE: [
			[ new Mesh() ]// TODO
		]

	};

	this.setActivePlane = function ( axis ) {

		if ( axis === "E" ) this.activePlane = this.planes[ "XYZE" ];

		if ( axis === "X" ) this.activePlane = this.planes[ "YZ" ];

		if ( axis === "Y" ) this.activePlane = this.planes[ "XZ" ];

		if ( axis === "Z" ) this.activePlane = this.planes[ "XY" ];

	};

	this.update = function ( rotation, eye2 ) {

		TransformGizmo.prototype.update.apply( this, arguments );

		var group = {

			handles: this[ "handles" ],
			pickers: this[ "pickers" ]

		};

		var tempMatrix = new Matrix4();
		var worldRotation = new Euler( 0, 0, 1 );
		var tempQuaternion = new Quaternion();
		var unitX = new Vector3( 1, 0, 0 );
		var unitY = new Vector3( 0, 1, 0 );
		var unitZ = new Vector3( 0, 0, 1 );
		var quaternionX = new Quaternion();
		var quaternionY = new Quaternion();
		var quaternionZ = new Quaternion();
		var eye = eye2.clone();

		worldRotation.copy( this.planes[ "XY" ].rotation );
		tempQuaternion.setFromEuler( worldRotation );

		tempMatrix.makeRotationFromQuaternion( tempQuaternion ).getInverse( tempMatrix );
		eye.applyMatrix4( tempMatrix );

		this.traverse( function( child ) {

			tempQuaternion.setFromEuler( worldRotation );

			if ( child.name === "X" ) {

				quaternionX.setFromAxisAngle( unitX, Math.atan2( - eye.y, eye.z ) );
				tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
				child.quaternion.copy( tempQuaternion );

			}

			if ( child.name === "Y" ) {

				quaternionY.setFromAxisAngle( unitY, Math.atan2( eye.x, eye.z ) );
				tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY );
				child.quaternion.copy( tempQuaternion );

			}

			if ( child.name === "Z" ) {

				quaternionZ.setFromAxisAngle( unitZ, Math.atan2( eye.y, eye.x ) );
				tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ );
				child.quaternion.copy( tempQuaternion );

			}

		} );

	};

	this.init();

};

TransformGizmoRotate.prototype = Object.create( TransformGizmo.prototype );
TransformGizmoRotate.prototype.constructor = TransformGizmoRotate;

function TransformGizmoScale() {

	TransformGizmo.call( this );

	var arrowGeometry = new Geometry();
	var mesh = new Mesh( new BoxGeometry( 0.125, 0.125, 0.125 ) );
	mesh.position.y = 0.5;
	mesh.updateMatrix();

	arrowGeometry.merge( mesh.geometry, mesh.matrix );

	var lineXGeometry = new BufferGeometry();
	lineXGeometry.addAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0,  1, 0, 0 ], 3 ) );

	var lineYGeometry = new BufferGeometry();
	lineYGeometry.addAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0,  0, 1, 0 ], 3 ) );

	var lineZGeometry = new BufferGeometry();
	lineZGeometry.addAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0,  0, 0, 1 ], 3 ) );

	this.handleGizmos = {

		X: [
			[ new Mesh( arrowGeometry, new GizmoMaterial( { color: 0xff0000 } ) ), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ],
			[ new Line( lineXGeometry, new GizmoLineMaterial( { color: 0xff0000 } ) ) ]
		],

		Y: [
			[ new Mesh( arrowGeometry, new GizmoMaterial( { color: 0x00ff00 } ) ), [ 0, 0.5, 0 ] ],
			[ new Line( lineYGeometry, new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
		],

		Z: [
			[ new Mesh( arrowGeometry, new GizmoMaterial( { color: 0x0000ff } ) ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ] ],
			[ new Line( lineZGeometry, new GizmoLineMaterial( { color: 0x0000ff } ) ) ]
		],

		XYZ: [
			[ new Mesh( new BoxBufferGeometry( 0.125, 0.125, 0.125 ), new GizmoMaterial( { color: 0xffffff, opacity: 0.25 } ) ) ]
		]

	};

	this.pickerGizmos = {

		X: [
			[ new Mesh( new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0.6, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
		],

		Y: [
			[ new Mesh( new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0.6, 0 ] ]
		],

		Z: [
			[ new Mesh( new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ] ]
		],

		XYZ: [
			[ new Mesh( new BoxBufferGeometry( 0.4, 0.4, 0.4 ), pickerMaterial ) ]
		]

	};

	this.setActivePlane = function ( axis, eye ) {

		var tempMatrix = new Matrix4();
		eye.applyMatrix4( tempMatrix.getInverse( tempMatrix.extractRotation( this.planes[ "XY" ].matrixWorld ) ) );

		if ( axis === "X" ) {

			this.activePlane = this.planes[ "XY" ];
			if ( Math.abs( eye.y ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "XZ" ];

		}

		if ( axis === "Y" ) {

			this.activePlane = this.planes[ "XY" ];
			if ( Math.abs( eye.x ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "YZ" ];

		}

		if ( axis === "Z" ) {

			this.activePlane = this.planes[ "XZ" ];
			if ( Math.abs( eye.x ) > Math.abs( eye.y ) ) this.activePlane = this.planes[ "YZ" ];

		}

		if ( axis === "XYZ" ) this.activePlane = this.planes[ "XYZE" ];

	};

	this.init();

};

TransformGizmoScale.prototype = Object.create( TransformGizmo.prototype );
TransformGizmoScale.prototype.constructor = TransformGizmoScale;

export { TransformGizmo, TransformGizmoTranslate, TransformGizmoRotate, TransformGizmoScale };
