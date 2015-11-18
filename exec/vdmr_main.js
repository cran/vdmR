var winobj = {};
var prehid = [];


window.addEventListener("message", function(e){

	for(var i=0;i<winlist.length;i++){
		if(e.data.winname!=winlist[i] && (typeof winobj[winlist[i]]!='undefined')){
			winobj[winlist[i]].postMessage(e.data.hid, "*");
		}
	}

	hlRows(e.data.hid);

}, false);

function setSelToolVisibility(sel){
	for(var i=0;i<winlist.length;i++){
		if(typeof winobj[winlist[i]]!='undefined'){
			winobj[winlist[i]].postMessage(sel.options[sel.selectedIndex].textContent, "*");
		}
	}
}

function hlRows(hid){

	for(var i in prehid){
		$('#df').DataTable().row(prehid[i]-1).nodes().to$().removeClass('selected');
	}

	prehid = [];

	for(var i in hid){
		$('#df').DataTable().row(hid[i]-1).nodes().to$().addClass('selected');
		prehid.push(hid[i]);
	}

}

function newwin(winname){
	winobj[winname] =
	window.open(winname+'.'+tag+'.svg.html', winname, 'width=520, height=400');
}

function getColumnData(col){
	return($('#df').DataTable().column(col).data());
}

function getDataValue(i,j){
	return($('#df').DataTable().row(i).data()[j]);
}

function init(){

	inlineplot = document.getElementById("inlineplot");
	if(!inlineplot){
		bw = 100.0/winlist.length;
		for(var i=0;i<winlist.length;i++){
			var newButton = document.createElement("button");
			newButton.setAttribute("id", winlist[i]);
			newButton.setAttribute("type", "button");
			newButton.setAttribute("value", winlist[i]);
			newButton.setAttribute("onclick", "newwin('"+winlist[i]+"')");
			newButton.setAttribute("style", "width:"+bw+"%;font-size:16px;padding:5px;");

			var buttonLabel = document.createTextNode(winlist[i]);
			newButton.appendChild(buttonLabel);

			var buttonParent = document.getElementById("buttons");
			buttonParent.appendChild(newButton);
		}
	} else {
		for(var i=0;i<winlist.length;i++){
			winobj[winlist[i]] = document.getElementById(winlist[i]).contentWindow;
		}
	}

	$(document).ready( function() {
		$('#df').dataTable({
			"scrollX": true
		});

		var table = $('#df').DataTable();
		$('#df tbody').on('click', 'tr', function(){
			$(this).toggleClass('selected');

			if($(this).hasClass('selected')==true){
				prehid.push(table.row(this).index()+1);
			} else {
				prehid.splice(prehid.indexOf(table.row(this).index()+1),1);
			}

			for(w in winobj){
				if((typeof winobj[w])!=='undefined'){
					winobj[w].postMessage(prehid,"*");
				}
			}


		});

	});

	document.addEventListener('copy', function(evt){
		evt.preventDefault();
		evt.clipboardData.setData('text/plain', getSelectedData());
	}, false);

}

function getSelectedData(){
	header = '';
	for(i=0;i<colnames.length;i++){
		header = header + colnames[i];
		if(i<colnames.length-1){
			header = header + '\t';
		} else{
			header = header + '\n';
		}
	}

	rows = $('#df').DataTable().rows('.selected').indexes();
	return(header + array2txt($('#df').DataTable().rows(rows).data()));

}

function array2txt(array){
	txt = '';
	for(i=0;i<array.length;i++){
		for(j=0;j<array[i].length;j++){
			txt = txt + array[i][j];
			if(j<array[i].length-1){
				txt = txt + '\t';
			} else {
				txt = txt + '\n';
			}
		}
	}

	return(txt);
}
