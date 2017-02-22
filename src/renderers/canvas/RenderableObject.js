import { Color } from '../../math/Color';
import { Vector2 } from '../../math/Vector2';
import { Vector3 } from '../../math/Vector3';
import { Vector4 } from '../../math/Vector4';

function RenderableObject() {

	this.id = 0;

	this.object = null;
	this.z = 0;
	this.renderOrder = 0;

}

function RenderableVertex() {

	this.position = new Vector3();
	this.positionWorld = new Vector3();
	this.positionScreen = new Vector4();

	this.visible = true;

}

RenderableVertex.prototype.copy = function ( vertex ) {

    this.position.copy( vertex.position );
	this.positionWorld.copy( vertex.positionWorld );
	this.positionScreen.copy( vertex.positionScreen );
	
	this.visible = vertex.visible;

};

function RenderableLine() {

	this.id = 0;

	this.v1 = new RenderableVertex();
	this.v2 = new RenderableVertex();

	this.vertexColors = [ new Color(), new Color() ];
	this.material = null;

	this.z = 0;
	this.renderOrder = 0;

};

function RenderableFace() {

	this.id = 0;

	this.v1 = new RenderableVertex();
	this.v2 = new RenderableVertex();
	this.v3 = new RenderableVertex();

	this.normalModel = new Vector3();

	this.vertexNormalsModel = [ new Vector3(), new Vector3(), new Vector3() ];
	this.vertexNormalsLength = 0;

	this.color = new Color();
	this.material = null;
	this.uvs = [ new Vector2(), new Vector2(), new Vector2() ];

	this.z = 0;
	this.renderOrder = 0;

};

function RenderableSprite() {

	this.id = 0;

	this.object = null;

	this.x = 0;
	this.y = 0;
	this.z = 0;

	this.rotation = 0;
	this.scale = new Vector2();

	this.material = null;
	this.renderOrder = 0;

};

export { RenderableObject, RenderableVertex, RenderableLine, RenderableFace, RenderableSprite };
