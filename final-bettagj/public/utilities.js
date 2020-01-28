function QueryGetAllFilms() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function ReceivedCallback() {
    if(this.readyState == 4 && this.status == 200) {
      console.log(JSON.parse(this.responseText));
      document.getElementById("output").innerHTML = FilmTable(JSON.parse(this.responseText));
    }
  };
  xhttp.open("GET", "/api/films", true);
  xhttp.send();
}

function FilmTable(data) {
  var retval = '';
  retval += '<div class="jumbotron"> \n' +
		'<table class="table table-bordered table-hover"> \n' +
		'	<thead> \n' +
		'		<tr> \n' +
		'			<th scope="col">FilmID</th> \n' +
		'			<th scope="col">Title</th> \n' +
		'			<th scope="col">Description</th> \n' +
    '			<th scope="col">Release Year</th> \n' +
    '			<th scope="col">Length</th> \n' +
    '     <th scope="col">Rating</th> \n' +
    '     <th scope="col">Category</th> \n' +
    '     <th scope="col">Last Update</th> \n' +
		'		</tr> \n' +
		'	</thead> \n' +
		'	<tbody> \n';

    for (var i = 0; i < data.length; i++) {
      var film = data[i];
      retval += "<tr>";
        for (var field in film) {
          retval += "<td>" + film[field] + "</td>";
        }
        retval += "</tr>";
    }
    retval +=
		'</tbody> \n' +
		'</table> \n' +
    '</div> \n ' ;
    return retval;
}

function QueryGetFilmByID() {
  const id = document.getElementById('id').value;
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function ReceivedCallback() {
    if(this.readyState === 4 && this.status === 200) {
      document.getElementById('output').innerHTML = filmByIDTable(JSON.parse(this.responseText));
    }
  };
  xhttp.open("GET", "/api/films/" + id, true);
  xhttp.send();
}

function filmByIDTable(data) {
  var retval = '';
  retval += '<div class="jumbotron"> \n' +
		'<table class="table table-bordered table-hover"> \n' +
		'	<thead> \n' +
		'		<tr> \n' +
		'			<th scope="col">FilmID</th> \n' +
		'			<th scope="col">Title</th> \n' +
		'			<th scope="col">Description</th> \n' +
    '			<th scope="col">Release Year</th> \n' +
    '			<th scope="col">Length</th> \n' +
    '     <th scope="col">Rating</th> \n' +
    '     <th scope="col">Category</th> \n' +
    '     <th scope="col">Last Update</th> \n' +
		'		</tr> \n' +
		'	</thead> \n' +
		'	<tbody> \n';

    for (var i = 0; i < data.length; i++) {
      var film = data[i];
      retval += "<tr>";
        for (var field in film) {
          retval += "<td>" + film[field] + "</td>";
        }
        retval += "</tr>";
    }
    retval +=
		'</tbody> \n' +
		'</table> \n' +
    '</div> \n ' ;
    return retval;
}

function QueryGetCategoryByID() {
  const id = document.getElementById('id').value;
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function ReceivedCallback() {
    if(this.readyState === 4 && this.status === 200) {
      document.getElementById('output').innerHTML = categoryByIDTable(JSON.parse(this.responseText));
    }
  };
  xhttp.open("GET", "/api/categories/" + id, true);
  xhttp.send();
}

function categoryByIDTable(data) {
  var retval = '';
  retval += '<div class="jumbotron"> \n' +
		'<table class="table table-bordered table-hover"> \n' +
		'	<thead> \n' +
		'		<tr> \n' +
		'			<th scope="col">CategoryID</th> \n' +
		'			<th scope="col">Name</th> \n' +
		'			<th scope="col">Last Update</th> \n' +
		'		</tr> \n' +
		'	</thead> \n' +
		'	<tbody> \n';

    for (var i = 0; i < data.length; i++) {
      var film = data[i];
      retval += "<tr>";
        for (var field in film) {
          retval += "<td>" + film[field] + "</td>";
        }
        retval += "</tr>";
    }
    retval +=
		'</tbody> \n' +
		'</table> \n' +
    '</div> \n ' ;
    return retval;
}

function QueryGetAllCategories() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function ReceivedCallback() {
    if(this.readyState == 4 && this.status == 200) {
      console.log(JSON.parse(this.responseText));
      document.getElementById("output").innerHTML = CategoryTable(JSON.parse(this.responseText));
    }
  };
  xhttp.open("GET", "/api/categories", true);
  xhttp.send();
}

function CategoryTable(data) {
  var retval = '';
  retval += '<div class="jumbotron"> \n' +
		'<table class="table table-bordered table-hover"> \n' +
		'	<thead> \n' +
		'		<tr> \n' +
		'			<th scope="col">ID</th> \n' +
		'			<th scope="col">Name</th> \n' +
		'			<th scope="col">Last Update</th> \n' +
		'		</tr> \n' +
		'	</thead> \n' +
		'	<tbody> \n';

    for (var i = 0; i < data.length; i++) {
      var category = data[i];
      retval += "<tr>";
        for (var field in category) {
          retval += "<td>" + category[field] + "</td>";
        }
        retval += "</tr>";
    }
    retval +=
		'</tbody> \n' +
		'</table> \n' +
    '</div> \n ' ;
    return retval;
}

function QueryGetCurrentCategories() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function ReceivedCallback() {
    if(this.readyState == 4 && this.status == 200) {
      //console.log(JSON.parse(this.responseText));
      document.getElementById("category").innerHTML = CreateOptions(JSON.parse(this.responseText));
      //CreateOptions(JSON.parse(this.responseText));
    }
  };
  xhttp.open("GET", "/api/just-categories", true);
  xhttp.send();
}

function CreateOptions(data) {
  var retval = '';
  var select = document.getElementById("category");
  console.log(data);
  for(let c in data) {
    retval += `<option value=${parseInt(c)+1}> ${data[c].name} </option> \n`;
  }
  return retval;
}
