var svgns = "http://www.w3.org/2000/svg";
var xlinkns = "http://www.w3.org/1999/xlink";

var hidnum = {}; // highlighting polygon id => its numer
var mousedown = 0; // flag for mouse dragging

// retrieving all polygons and setting event listener

var polcol = {}; // polygon id => color

if(parent.opener){
	pwin = parent.opener;
} else {
	pwin = parent.parent;
}

for(var i=0;i<polnum.length;i++){
	pol = document.getElementById("GRID.polygon."+polnum[i]);
	col = document.getElementById("GRID.polygon."+polnum[i]+".1").getAttribute('fill');
	polcol[pol.id] = col;

	pol.setAttribute('desc', i);

	pol.addEventListener("mousemove", function(evt){
		if(mousedown==1){
			highlight(evt.target.parentNode.id);
		}
		hoverPopUp(evt);
	}, false);

	pol.setAttribute('onmouseout', 'hoverPopUpErase(evt)');
	pol.setAttribute('onclick', 'createIdentText(evt)');
}

parent.addEventListener('copy', function(evt){
	evt.preventDefault();
	evt.clipboardData.setData('text/plain', pwin.getSelectedData());
}, false);

document.documentElement.addEventListener("mousedown", function(evt){
	evt.preventDefault();
	mousedown=1;
}, false);

document.documentElement.addEventListener("mouseup", function(evt){
	mousedown=0;
	pwin.postMessage({'hid':hidnum, 'winname':winname}, "*");

}, false);

document.documentElement.addEventListener("dblclick", function(evt){
	turnbackall();
	clearIdentText(evt);
	pwin.postMessage({'hid':hidnum, 'winname':winname}, "*");
}, false);

document.documentElement.addEventListener("mousemove", function(evt){
}, false);

parent.addEventListener("message", function(e){

	if(typeof e.data == 'string'){
		return;
	}

	tmp = [];
	for(var i in e.data){
		tmp.push(dtom[e.data[i]]);
	}

	turnbackall();
	for(var i=1;i<=polnum.length;i++){
		if(tmp.indexOf(i)>=0){
			highlight("GRID.polygon."+i);
		}
	}

}, false);

function highlight(pid){
	if(!hidnum[pid]){
		paintSubPolygons(document.getElementById(pid), 'red');
		hidnum[pid] = parseInt(pid.replace("GRID.polygon.",""),10);
	}

}

function turnbackall(){
	for(var pol in polcol){
		paintSubPolygons(document.getElementById(pol), polcol[pol]);
	}
	hidnum = {};
}

function paintSubPolygons(node, col){
	pol = node.childNodes;
	for(var i=0;i<pol.length;i++){
		if(pol[i].nodeName=='polygon'){
			pol[i].setAttribute('fill', col);
		}
	}
}

// display popup
function hoverPopUp(evt){
	popuptext.setAttribute('x', evt.clientX+5);
	popuptext.setAttribute('y', evt.clientY-5);
	num = parseInt(evt.target.parentNode.getAttribute('desc'));
	pupval = pwin.getDataValue(num, parseInt(
		pwin.document.forms.form1.identify.selectedIndex));
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
	num = parseInt(evt.target.parentNode.getAttribute('desc'));
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
