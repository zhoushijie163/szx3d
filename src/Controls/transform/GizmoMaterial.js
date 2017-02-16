import { FrontSide } from '../../constants';
import { MeshBasicMaterial } from '../../materials/MeshBasicMaterial';

function GizmoMaterial( parameters ) {

	MeshBasicMaterial.call( this );

	this.depthTest = false;
	this.depthWrite = false;
	this.side = FrontSide;
	this.transparent = true;

	this.setValues( parameters );

	this.oldColor = this.color.clone();
	this.oldOpacity = this.opacity;

	this.highlight = function( highlighted ) {

		if ( highlighted ) {

			this.color.setRGB( 1, 1, 0 );
			this.opacity = 1;

		} else {

			this.color.copy( this.oldColor );
			this.opacity = this.oldOpacity;

		}

	};

};

GizmoMaterial.prototype = Object.create( MeshBasicMaterial.prototype );
GizmoMaterial.prototype.constructor = GizmoMaterial;

import { LineBasicMaterial } from '../../materials/LineBasicMaterial';

function GizmoLineMaterial( parameters ) {

	LineBasicMaterial.call( this );

	this.depthTest = false;
	this.depthWrite = false;
	this.transparent = true;
	this.linewidth = 1;

	this.setValues( parameters );

	this.oldColor = this.color.clone();
	this.oldOpacity = this.opacity;

	this.highlight = function( highlighted ) {

		if ( highlighted ) {

			this.color.setRGB( 1, 1, 0 );
			this.opacity = 1;

		} else {

			this.color.copy( this.oldColor );
			this.opacity = this.oldOpacity;

		}

	};

};

GizmoLineMaterial.prototype = Object.create( LineBasicMaterial.prototype );
GizmoLineMaterial.prototype.constructor = GizmoLineMaterial;

export { GizmoMaterial, GizmoLineMaterial };
