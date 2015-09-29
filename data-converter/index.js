/* globals require: true, console: true */

'use strict';

var fs = require('fs');
var path = require('path');
var XLSX = require('XLSX');

var argv = require('minimist')(process.argv.slice(2));
console.dir(argv);

function rowCellsToArray(row, start, end) {
	var array = [];

	for (var i = start; i < end; i++) {
		if (row.length && row[i] !== null) {
			//console.log(i, row, row[i]);
			array.push(row[i]);
		}
	}
	return array;
}



function getIdFromName(users, username) {

	if(username == undefined) {
		return false;
	}

	var user = users.filter(function(user) {
		return user.name === username; // filter out appropriate one
	});

	if(!user.length) {
		console.warn('Did not find: ', username);
		return false;
	}

	// We don't support more users with the same name right now.
	if (user.length > 1) {
		throw new Error('Too many users.');
	}

	return user[0].index;
}

var dataFile = "C:/Users/Allan/Dropbox/ONA/Vaskede data fra SurveyMonkey.xls";
//var dataFile = './sample-data/sample-data-from-surveymoney.xls';

fs.readFile(path.resolve(dataFile), function(err, body) {
	if (err) {
		throw err;
	}

	var ws = XLSX.read(body);

	var data = Object.keys(ws.Sheets).map(function(sheet) {
		return {
			name: sheet,
			sheet: XLSX.utils.sheet_to_json(ws.Sheets[sheet], {header: 1, raw: true}),
			test: XLSX.utils.sheet_to_row_object_array(ws.Sheets[sheet])
		};
	});

	//console.log(data[0].sheet);

	var users = [];
	var indexUsers = 0;

	data[0].sheet.forEach(function(row, index, rowArray) {

		// These are the two "meta"-rows, we don't want to process them right now.
		// Later on we want to use these for generating the data-set names.
		if (index < 2) {
			return;
		}

		var user = {
			index: indexUsers,
			name: row[6],
			group: row[8],
			answers: [
				{
					name: rowArray[1][9],
					description: rowArray[0][9],
					data: rowCellsToArray(row, 9, 18)
				},
				{
					name: rowArray[1][19],
					description: rowArray[0][19],
					data: rowCellsToArray(row, 19, 29)
				}
				//rowCellsToArray(row, 9, 18),
				//rowCellsToArray(row, 19, 29),
				//rowCellsToArray(row, 30, 40)
			]
		};

		// If we don't have a name don't do anything
		if (!user.name) {
			return;
		}

		console.log('#############' + rowArray[1][9] + '###############');
		console.log(user.name + ' from ' + user.group + ' picked: ' + user.answers);
		console.log(JSON.stringify(user));

		indexUsers = indexUsers + 1;

		users.push(user);
	});

 	var links = [];
	users.forEach(function(user) {
		console.log('### Creating links for %s ----- %s', user.answers[0].name , user.answers[0].description);
		user.answers[0].data.forEach(function(answer, index, sourceArray) {

			if(answer == undefined) {
				return false;
			}

			var link = {
				"source": user.index,
				"target": getIdFromName(users, answer)
			};

			console.log('LINK: %s   (%s)  ->  %s (%s)', user.name, user.index, answer, link.target);

			if(link.target) {
				links.push(link);
			}

		});
	});

	var graphData = {
	  "nodes": users,
		"links": links
	};

	var outputFilename = './sample-data/sample-data-from-surveymoney.json';

	fs.writeFile(outputFilename, JSON.stringify(graphData, null, 4), function(err) {
	    if(err) {
	      console.log(err);
	    } else {
	      console.log("JSON saved to " + outputFilename);
	    }
	});

});
