var text1;

var testString;

var obj;

document.getElementById('button').onclick = function()
{
	text1 = document.getElementById('myTextArea').value;

	var r = new XMLHttpRequest(); 
	r.open("GET", "http://localhost:8082/oracle/getAuthorWords", true);
	r.onreadystatechange = function () {
    		if (r.readyState != 4 || r.status != 200) return; 
                        testString = r.responseText;
    			console.log(r.responseText);
			alert(testString);
		};
	r.send("a=2&b=2&c=3");

};

function sendTextToWebService()
{

}

function retrieveDataFromChetsProcess()
{

}

function displayData()
{

}


