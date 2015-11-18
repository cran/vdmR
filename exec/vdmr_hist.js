var svgns = "http://www.w3.org/2000/svg";
var xlinkns = "http://www.w3.org/1999/xlink";

var hidcol = {};
var hidnum = {};

var selectedElement = 0;
var currentX = 0;
var currentY = 0;
var currentMatrix = 0;

// persistent selection or not (default: not persistent)
var persistent = 0;

// retrieving height of SVG
var svgheight = parseFloat(document.documentElement.getAttribute('height').replace("px",""));
var svgwidth = parseFloat(document.documentElement.getAttribute('width').replace("px",""));

if(parent.opener){
	pwin = parent.opener;
} else {
	pwin = parent.parent;
}

document.addEventListener('copy', function(evt){
	evt.preventDefault();
	evt.clipboardData.setData('text/plain', pwin.getSelectedData());
}, false);

parent.addEventListener("message", function(e){

	if(typeof e.data == 'string'){
		selbox = document.getElementById('selbox');
		selbox.setAttribute('visibility', e.data);
		return;
	}

	turnbackall();
	for(var i=0;i<hlcount.length;i++) hlcount[i]=0;
	for(var i in e.data){
		hlcount[whichcls[e.data[i]-1]-1]++;
	}

	sethlbar();

}, false);

function sethlbar(){
	hidcol = {};
	for(var i=0;i<hlcount.length;i++){
		hlbar = document.getElementById("hlbar.1."+(i+1));
		if(hlcount[i]!=0){
			hlbar.setAttribute("height", grh2[i]*hlcount[i]/count[i]);
			hidcol["hlbar.1."+(i+1)] = "red";
		} else {
			hlbar.setAttribute("height", 0);
			delete hidcol["hlbar.1."+(i+1)];
		}
	}
}

function turnback(pid){
	var p = document.getElementById(pid);
	p.setAttribute("fill", hidcol[pid]);
	delete hidcol[pid];
}

function turnbackall(){
	for(var hid in hidcol){
		turnback(hid);
	}
	hidcol = {};
	hidnum = {};
}

// retrieving parameters of all histogram bars
var gr = document.getElementById("geom_rect.rect.1");

var grchildren = gr.childNodes;
var hlcount = []

var grx = [];
var gry = [];
var grw = [];
var grh = [];

for(var i=0; i<grchildren.length; i++){
	if(grchildren[i].nodeName=='rect'){
		grx.push(parseFloat(grchildren[i].getAttribute('x')));
		gry.push(parseFloat(grchildren[i].getAttribute('y')));
		grw.push(parseFloat(grchildren[i].getAttribute('width')));
		grh.push(parseFloat(grchildren[i].getAttribute('height')));
		grchildren[i].setAttribute('onmousemove', 'hoverPopUp(evt)');
		grchildren[i].setAttribute('onmouseout', 'hoverPopUpErase(evt)');
	}
}

var grx2 = [];
var gry2 = [];
var grw2 = [];
var grh2 = [];

var grxunq = unique(grx);
var grxidx = [];
for(var i=0; i<grxunq.length; i++){
	grxidx.push(grx.indexOf(grxunq[i]));
	hlcount.push(0);
}
grxidx.push(grx.length);

for(var i=0; i<grxidx.length-1; i++){
	grh2.push(0);
	for(var j=grxidx[i]; j<grxidx[i+1]; j++){
		grh2[i] = grh2[i] + grh[j];
	}
	gry2.push(gry[grxidx[i+1]-1]);
	grw2.push(grw[grxidx[i+1]-1]);
}

grx2 = grxunq;


// display popup
function hoverPopUp(evt){
	popuptext.setAttribute('x', evt.clientX+5);
	popuptext.setAttribute('y', evt.clientY-5);
	histbarx = parseFloat(evt.target.getAttribute('x'));
	k = grxunq.indexOf(histbarx);
	hovertext = '['+xmin[k]+','+xmax[k]+'] count: '+count[k];
	popuptext.textContent = hovertext;
	popuptext.setAttribute('text-decoration', 'underline');
	popuptext.setAttribute('display', 'inline');
}

// erase popup
function hoverPopUpErase(evt){
	popuptext.setAttribute('display', 'none');
}

// create popup

function createPopUp(){
	popuptext = document.createElementNS(svgns, 'text');
	popuptext.setAttribute('id','popuptext');
	popuptext.setAttribute('x',100);
	popuptext.setAttribute('y',100);
	popuptext.setAttribute('fill','#000');
	popuptext.textContent = 'hogehoge';
	popuptext.setAttribute('display','none');

	document.documentElement.appendChild(popuptext);
}

createPopUp();


// selection box

function createSelLayer(){
	selLayer = document.createElementNS(svgns, 'rect');
	selLayer.setAttribute('x', 0);
	selLayer.setAttribute('y', 0);
	selLayer.setAttribute('width', svgwidth);
	selLayer.setAttribute('height', svgheight);
	selLayer.setAttribute('id', 'selLayer');
	selLayer.setAttribute('fill', 'green');
	selLayer.setAttribute('opacity', 0.0);
	selLayer.setAttribute('pointer-events','none');

	document.documentElement.appendChild(selLayer);

}

function createSelBox(){

	seldefs = document.createElementNS(svgns, 'defs');

	selsymb = document.createElementNS(svgns, 'symbol');
	selsymb.setAttribute('id', 'selsymb');
	selsymb.setAttribute('opacity', '0.5');
	selsymb.setAttribute('viewBox', '0 0 100 100');
	selsymb.setAttribute('preserveAspectRatio', 'none');

	selrect = document.createElementNS(svgns, 'rect');
	selrect.setAttribute('x','0');
	selrect.setAttribute('y','0');
	selrect.setAttribute('id', 'selrect');
	selrect.setAttribute('width','100');
	selrect.setAttribute('height','100');
	selrect.setAttribute('fill', 'grey');
	selrect.setAttribute('style', 'cursor: move');

	selrect.setAttribute('onmousedown', "selectSelBox(evt);");

	selsymb.appendChild(selrect);

	selhandle = document.createElementNS(svgns, 'ellipse');
	selhandle.setAttribute('cx','100');
	selhandle.setAttribute('cy','100');
	selhandle.setAttribute('rx','20');
	selhandle.setAttribute('ry','20');

	selhandle.setAttribute('style', 'cursor: se-resize');

	selhandle.setAttribute('onmousedown', "selectHandle(evt);");

	selsymb.appendChild(selhandle);

	seldefs.appendChild(selsymb);

	document.documentElement.appendChild(seldefs);

	selbox = document.createElementNS(svgns, 'use');
	selbox.setAttributeNS(xlinkns, 'xlink:href', '#selsymb');
	selbox.setAttribute('x','0');
	selbox.setAttribute('y','0');
	selbox.setAttribute('width','50');
	selbox.setAttribute('height','50');
	selbox.setAttribute('id', 'selbox');
	selbox.setAttribute('transform', "matrix(1 0 0 1 0 0)");

	selbox.addEventListener("click", function(evt){dblclickSelBox(evt)});

	document.documentElement.appendChild(selbox);

}

createSelLayer();
createSelBox();

function selectSelBox(evt){
	selectedElement = document.getElementById("selbox");
	currentX = evt.clientX;
	currentY = evt.clientY;
	currentMatrix = selectedElement.getAttribute("transform").slice(7,-1).split(' ');

	for(var i=0; i<currentMatrix.length; i++){
		currentMatrix[i] = parseFloat(currentMatrix[i]);
	}

	selLayer.setAttributeNS(null, "pointer-events", "inherit");
	selLayer.setAttributeNS(null, "onmousemove", "moveSelBox(evt)");
	selLayer.setAttributeNS(null, "onmouseup", "deselectSelBox(evt)");
	selectedElement.setAttributeNS(null, "onmousemove", "moveSelBox(evt)");
	selectedElement.setAttributeNS(null, "onmouseup", "deselectSelBox(evt)");
}

function moveSelBox(evt){
	dx = evt.clientX - currentX;
	dy = evt.clientY - currentY;
	currentMatrix[4] += dx;
	currentMatrix[5] += dy;
	newMatrix = "matrix(" + currentMatrix.join(' ') + ")";

	selectedElement.setAttributeNS(null, "transform", newMatrix);
	currentX = evt.clientX;
	currentY = evt.clientY;

	for(var i=0;i<grx2.length;i++){
		if(grx2[i]+grw2[i]>=currentMatrix[4] && currentMatrix[4]+currentW>=grx2[i]){
			hlcount[i] = count[i];
		} else if(persistent==0) hlcount[i] = 0;

		sethlbar();
	}

	// retrieving indeices of the observation in the selected class,
	// and post them to the main window
	if(persistent==0) hidnum = {};

	for(var i in hidcol){
		for(var j=0;j<data.length;j++){
			if(whichcls[j]==parseInt(i.replace("hlbar.1.",""))){
				hidnum[j+1] = j+1;
			}
		}
	}

}

function deselectSelBox(evt){
  if(selectedElement != 0){
  	pwin.postMessage({'hid':hidnum, 'winname':winname}, "*");
    selLayer.removeAttributeNS(null, "onmousemove");
    selLayer.removeAttributeNS(null, "onmouseup");
    selectedElement.removeAttributeNS(null, "onmousemove");
    selectedElement.removeAttributeNS(null, "onmouseup");
		selLayer.setAttributeNS(null, "pointer-events", "none");
    selectedElement = 0;
  }
}

var currentW = 50;
var currentH = 50;
function selectHandle(evt){
	selectedElement = document.getElementById("selbox");
	currentX = evt.clientX;
	currentY = evt.clientY;

	currentW = parseFloat(selectedElement.getAttributeNS(null, 'width'));
	currentH = parseFloat(selectedElement.getAttributeNS(null, 'height'));

	selLayer.setAttributeNS(null, "pointer-events", "inherit");
	selLayer.setAttributeNS(null, "onmousemove", "moveHandle(evt)");
	selLayer.setAttributeNS(null, "onmouseup", "deselectHandle(evt)");
	selectedElement.setAttributeNS(null, "onmousemove", "moveHandle(evt)");
	selectedElement.setAttributeNS(null, "onmouseup", "deselectHandle(evt)");

	selhandle.setAttributeNS(null, 'fill', '#ff0000');

}

function moveHandle(evt){
	dx = evt.clientX - currentX;
	dy = evt.clientY - currentY;

	currentW = currentW + dx;
	currentH = currentH + dy;

	selbox = document.getElementById('selbox');

	if(currentW>10 && currentH>10){
		selbox.setAttributeNS(null, 'width', currentW);
		selbox.setAttributeNS(null, 'height', currentH);
		selhandle.setAttributeNS(null, 'rx', 20*50/currentW);
		selhandle.setAttributeNS(null, 'ry', 20*50/currentH);
	}

	currentX = evt.clientX;
	currentY = evt.clientY;
}

function deselectHandle(evt){
	selhandle.setAttributeNS(null, 'fill', 'black');
	deselectSelBox(evt);
}

function dblclickSelBox(evt){
	if(evt.detail==2){
		selbox = document.getElementById('selrect');
		if(persistent==0){
			selbox.setAttributeNS(null, 'fill', 'yellow');
			persistent = 1;
		} else {
			selbox.setAttributeNS(null, 'fill', 'grey');
			persistent = 0;
		}
	}
}


function unique(array) {
	var storage = {};
	var uniqueArray = [];
	var i,value;
	for ( i=0; i<array.length; i++) {
		value = array[i];
		if (!(value in storage)) {
			storage[value] = true;
			uniqueArray.push(value);
		}
	}
	return uniqueArray;
}
