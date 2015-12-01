
/* http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript/901144#901144 */
function getParameterByName(name) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
	results = regex.exec(location.search);
	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function createAuthorList(){
	var r = new XMLHttpRequest(); 
	r.open('GET', 'http://localhost:8082/oracle/listAuthors', true);
	r.onreadystatechange = function () {
		if (r.readyState != 4 || r.status != 200) return; 
		var data = JSON.parse(r.response);
		authorList(data);
	};
	r.send();
}

function createDocumentList(){
	var r = new XMLHttpRequest(); 
	r.open('GET', 'http://localhost:8082/oracle/listDocuments', true);
	r.onreadystatechange = function () {
		if (r.readyState != 4 || r.status != 200) return; 
		var data = JSON.parse(r.response);
		documentList(data);
	};
	r.send();
}

function createDocumentWordCloud(document)
{
	var r = new XMLHttpRequest(); 
	r.open('GET', 'http://localhost:8082/oracle/getAuthor', true);
	r.onreadystatechange = function () {
		if (r.readyState != 4 || r.status != 200) return; 
		var data = JSON.parse(r.response);
		var freqs = [];

		for(var d in data){
			var obj = {};
			obj.text = data[d].text;
			obj.size = 5+500*data[d].frequency;
			freqs.push(obj);
		}

		wordCloud(freqs);			 
	};
	r.send('a='+document);
}

function createAuthorInfoPage(){
	var author = atob(getParameterByName('a'));
	var r = new XMLHttpRequest(); 
	r.open('GET', 'http://localhost:8082/oracle/getAuthor?a='+btoa(author), true);
	r.onreadystatechange = function () {
		if (r.readyState != 4 || r.status != 200) return; 
		var data = JSON.parse(r.response);

		documentList(data.documents)
		$('#author-name').html(authorName(author));
		wordCloud(convertFrequenciesToSize(data.frequencies));
	};
	r.send('a='+author);
}

function createDocumentInfoPage(){
	var doc = atob(getParameterByName('d'));
	var r = new XMLHttpRequest(); 
	r.open('GET', 'http://localhost:8082/oracle/getDocument?d='+btoa(doc), true);
	r.onreadystatechange = function () {
		if (r.readyState != 4 || r.status != 200) return; 
		var data = JSON.parse(r.response);

		$('#document-name').html(documentName(doc));
		$('#author-name').html(authorName(data.author));
		$('#document-text').text(data.text);
		wordCloud(convertFrequenciesToSize(data.frequencies));
	};
	r.send('d='+doc);
}

function documentName(doc){
	return '<a href=\'document_info.html?d=' + btoa(doc) + '\'>' +doc + '</a>'
}

function authorName(auth){
	return '<a href=\'author_info.html?a=' + btoa(auth) + '\'>' +auth + '</a>'
}

function documentList(data){
	for(var d in data){
		$('#document-list').append('<li>' +documentName(data[d])+'</li>');
	}
}

function authorList(data){
	for(var d in data){
		$('#author-list').append('<li>' +authorName(data[d])+'</li>');
	}
}

function searchText(){

	var text1 = $('#search-text').val();

	var r = new XMLHttpRequest(); 
	r.open("GET", "http://localhost:8082/oracle/classifyText?t="+btoa(text1), true);
	r.onreadystatechange = function () {
    		if (r.readyState != 4 || r.status != 200) return; 
            window.location.replace('author_info.html?a='+btoa(JSON.parse(r.response).author))
		};
	r.send();

}
function convertFrequenciesToSize(data){

	var freqs = [];
	for(var d in data){
		var obj = {};
		obj.text = data[d].text;
		obj.size = 2+10000*data[d].frequency;
		freqs.push(obj);
	}
	return freqs;
}


function createCorpusWordCloud(){

	var r = new XMLHttpRequest(); 
	r.open('GET', 'http://localhost:8082/oracle/getCorpusWords', true);
	r.onreadystatechange = function () {
		if (r.readyState != 4 || r.status != 200) return; 
		var data = JSON.parse(r.response);
		wordCloud(convertFrequenciesToSize(data));			 
	};
	r.send();
};

function wordCloud(frequency_list){

	var color = d3.scale.linear()
	.domain([0,1,2,3,4,5,6,10,15,20,100])
	.range(['#ddd', '#ccc', '#bbb', '#aaa', '#999', '#888', '#777', '#666', '#555', '#444', '#333', '#222']);

	d3.layout.cloud().size([800, 300])
	.words(frequency_list)
	.rotate(0)
	.fontSize(function(d) { return d.size; })
	.on('end', draw)
	.start();

	function draw(words) 
	{
		d3.select('body').append('svg')
		.attr('width', 850)
		.attr('height', 350)
		.attr('class', 'wordcloud')
		.append('g')
			// without the transform, words words would get cutoff to the left and top, they would
			// appear outside of the SVG area
			.attr('transform', 'translate(320,200)')
			.selectAll('text')
			.data(words)
			.enter().append('text')
			.style('font-size', function(d) { return d.size + 'px'; })
			.style('fill', function(d, i) { return color(i); })
			.attr('transform', function(d) {
				return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
			})
			.text(function(d) { return d.text; });
		}
	
}
