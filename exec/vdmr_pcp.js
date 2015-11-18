var svgns = "http://www.w3.org/2000/svg";
var xlinkns = "http://www.w3.org/1999/xlink";

var hidcol = {}; // to store the highlighting id and the original color of the points
var hidnum = {}; // to store the highlighting id and its numeric parts of the points

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

document.documentElement.setAttribute('onclick', 'clearIdentText(evt)');

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

	tmp = [];
	for(var i in e.data){
		tmp.push(e.data[i]);
	}

	for(var i=0;i<gpid.length;i++){
		if(tmp.indexOf(i+1)<0 && hidnum[gpid[i]]>0){
			turnback(gpid[i]);
		} else {
			if(tmp.indexOf(i+1)>=0){
				highlight(gpid[i]);
			}
		}
	}
}, false);

// retrieving coordinates on SVG of all points
var gp = document.getElementById("GRID.polyline.1");

var gpchildren = gp.childNodes;
var gpx = [];
var gpy = new Array(ncol);
var gpid = [];

for(var j=0;j<ncol;j++){
	gpy[j] = new Array();
}

var gpxflg = 0;
var cnt = 0;
for(var i=0; i<gpchildren.length;i++){
	if(gpchildren[i].nodeName=='polyline'){
		gpid.push(gpchildren[i].id);
		points = gpchildren[i].getAttribute('points').split(' ');

		for(var j=0;j<ncol;j++){
			gpy[j].push(parseFloat(points[j].split(',')[1]));
		}

		if(gpxflg==0){
			for(var j=0;j<ncol;j++){
				gpx.push(parseFloat(points[j].split(',')[0]));
			}
			if(gpx.length==ncol) gpxflg++;
		}

		tmp = document.getElementById(gpchildren[i].id);
		tmp.setAttribute('onmousemove', 'hoverPopUp(evt)');
		tmp.setAttribute('onmouseout', 'hoverPopUpErase(evt)');
		tmp.setAttribute('onclick', 'createIdentText(evt)');
		tmp.setAttribute('desc', cnt++);

	}
}

// display popup
function hoverPopUp(evt){
	popuptext.setAttribute('x', evt.clientX+5);
	popuptext.setAttribute('y', evt.clientY-5);
	num = parseInt(evt.target.getAttribute('desc'));
	pupval = pwin.getDataValue(num, parseInt(
		pwin.document.forms.form1.identify.selectedIndex));
	//popuptext.textContent = 'x:'+x[num]+', '+'y:'+y[num];
	popuptext.textContent = pupval;
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

// create identify text
var identtext = Array();

var identtextgroup = document.createElementNS(svgns, 'g');
identtextgroup.setAttribute('id','identtext');
document.documentElement.appendChild(identtextgroup);

function createIdentText(evt){
	identtext.push(document.createElementNS(svgns, 'text'));
	i = identtext.length-1;

	identtext[i].setAttribute('x', evt.clientX+5);
	identtext[i].setAttribute('y', evt.clientY-5);
	num = parseInt(evt.target.getAttribute('desc'));
	pupval = pwin.getDataValue(num, parseInt(
		pwin.document.forms.form1.identify.selectedIndex));
	identtext[i].textContent = pupval;
	identtext[i].setAttribute('text-decoration', 'underline');

	document.documentElement.getElementById('identtext').appendChild(identtext[i]);

}

function clearIdentText(evt){
	if(evt.detail==2){
		identtextall = document.documentElement.getElementById('identtext').childNodes;
		nlabels = identtextall.length;
		for(i=0;i<nlabels;i++){
			document.documentElement.getElementById('identtext').removeChild(identtextall[0]);
		}
		identtext = Array();
	}
}


function seldetect(srx1,sry1,srx2,sry2){
	selrange = gpx.concat([srx1,srx2]).sort(
	function(a,b){
		if(a<b) return -1;
		if(a>b) return 1;
		return 0;
	});
	if(srx2>srx1) {srmin=srx1; srmax=srx2;}
	else {srmin=srx2; srmax=srx1;}

	// delete the both ends of selrange when selection area is out of range of x
	if(selrange[0]<gpx[0]) selrange.shift();
	if(selrange[selrange.length-1]>gpx[ncol-1]) selrange.pop();

	while(selrange[0]<srmin){
		selrange.shift();
	}
	while(selrange[selrange.length-1]>srmax){
		selrange.pop();
	}

	// turnback when selection area is out of parallel coordinates
	if(selrange.length<2 && persistent==0){
		for(var i=0;i<nrow;i++){
			if(hidcol["GRID.polyline.1."+(i+1)]) turnback("GRID.polyline.1."+(i+1));
		}
	}

	sidx=0;
	while(selrange[0]>=gpx[sidx]) sidx++;

	for(var sridx=0;sridx<selrange.length-1;sridx++){
		x1 = selrange[sridx];
		x2 = selrange[sridx+1];
		for(var i=0;i<nrow;i++){
			y1 = (gpy[sidx][i]-gpy[sidx-1][i])*(x1-gpx[sidx-1])/(gpx[sidx]-gpx[sidx-1]) + gpy[sidx-1][i];
			y2 = (gpy[sidx][i]-gpy[sidx-1][i])*(x2-gpx[sidx-1])/(gpx[sidx]-gpx[sidx-1]) + gpy[sidx-1][i];
			if((sry1<=y1&&y1<=sry2 || sry2<=y1&&y1<=sry1) || (sry1<=y2&&y2<=sry2 || sry2<=y2&&y2<=sry1)){
				if(!hidcol["GRID.polyline.1."+(i+1)]) highlight("GRID.polyline.1."+(i+1));
			}
			else if(hidcol["GRID.polyline.1."+(i+1)] && persistent==0) turnback("GRID.polyline.1."+(i+1));

		}
		sidx++;
	}
}

function highlight(pid){
	var p = document.getElementById(pid);
	var pcol = p.getAttribute("stroke");
	if(pcol != "red"){
		hidcol[pid] = pcol;
		hidnum[pid] = parseInt(pid.replace("GRID.polyline.1.",""), 10);
	}
	p.setAttribute("stroke", "red");
	p.setAttribute("stroke-opacity", 1);
}

// opacity���ǂ����Ŋo���Ƃ����Ƃ������i�v�C���j
function turnback(pid){
	var p = document.getElementById(pid);
	p.setAttribute("stroke", hidcol[pid]);
	p.setAttribute("stroke-opacity", 0.5);
	delete hidcol[pid];
	delete hidnum[pid];

}

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

	seldetect(currentMatrix[4], svgheight-currentMatrix[5], currentMatrix[4]+currentW, svgheight-currentMatrix[5]-currentH);

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
