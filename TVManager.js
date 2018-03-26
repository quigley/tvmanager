var fs = require("fs");
var path = require("path");
var child_process = require("child_process");
var trash = require('trash');
var exclusions = ['XML', 'TempRec', '.vscode', 'node_modules'];
var cleanupExtensions = ['nfo', 'jpg'];
var baseDir = "k:\\Recorded TV\\";
let directories = [];
let files = [];

ExecuteFile("WTV-MetaRenamer.bat");
cleanupEmptyDirectories(baseDir);




function ExecuteFile(fileName){
	child_process.exec("cmd /c start " + '"'+'"'+" cmd /c " + fileName, function(err, stdout, stderr) {
		if(err){
			throw err;
		}
		console.log(stderr);
	});
}

function cleanupEmptyDirectories (baseDir){
	directoryWalker(baseDir, function(err, directories){
		if (err){
			throw err;
		}
		directories.forEach(function(dir){
			fileWalker(dir, function(err, files){
				if (err){
					throw err;
				}
				var tvFiles = 0;
				files.forEach(function(file){
					var fileExtension = file.split('.').pop();
					if (fileExtension === "wtv"){
						tvFiles = tvFiles+1;
					}
				});
			directoryWalker(dir, function(err, dirs) {
				if (dirs.length==0 && tvFiles==0){
					console.log('"' + dir + '"' + " will be deleted");
					//CleanupFiles(dir);
					trash([dir,null]).then(() => {
						console.log(dir + " deleted");
					})
					.catch((error)=> {
						throw error;
					});
				};
			});			
			});
		});
	});
}


function directoryWalker (sourceDir, done) {
	let results = [];
	fs.readdir(sourceDir, function(err, list) {
		if (err) return done(err);

		var pending = list.length;

		if(!pending) return done(null, results);

		list.forEach (function(dir) {
			dir = path.resolve(sourceDir, dir);

			fs.stat(dir, function(err, stat) {
				var isExempt = exclusions.includes(path.basename(dir));
				if (stat && stat.isDirectory() && !isExempt) {
					results.push(dir);

					directoryWalker(dir, function(err, res) {
						results = results.concat(res);
						if(!--pending) done(null, results);
						});
				} 
				else {
					if (!--pending) done(null, results);
				};
			});
		});
	});
}

function fileWalker (sourceDir, done) {
	let results = [];
	fs.readdir(sourceDir, function(err, list) {
		if (err) return done(err);

		var pending = list.length;

		if(!pending) return done(null, results);

		list.forEach (function(file) {
			file = path.resolve(sourceDir, file);

			fs.stat(file, function(err, stat) {
				if (stat && stat.isDirectory()) {
					fileWalker(file, function(err, res) {
						results = results.concat(res);
						if(!--pending) done(null, results);
					});
				} 
				else {
					results.push(file);

					if (!--pending) done(null, results);
				}
			});
		});
	});
}

function CleanupFiles(dir){
	fileWalker(dir, function(err, files){
		if (err){
			throw err;
		}
		files.forEach(function(file){
			var fileExtension = file.split('.').pop();
			var cleanUp = cleanupExtensions.includes(fileExtension);
				if (cleanUp){
					console.log(file + " will be deleted");
					trash([file,null]).then(() => {
						console.log(file + " deleted");
					})
					.catch((error)=> {
						throw error;
					});
				}
		});
	});
}