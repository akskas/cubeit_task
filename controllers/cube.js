'use strict';

var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);
//console.log('Database connection ', connection.config.host +" "+connection.config.port);

var emptyStr = "";

var createUser = function(req, res){
    var name = req.body.name;
    var city = req.body.city;
    
    var response = {
        id: -1,
        name: name,
        city: city
    };
    // save data in table
    var sql = 'INSERT INTO ' + dbconfig.user + ' (name, city, cubes, content) VALUES ("' + name + '","' + city + '","' + emptyStr + '","' + emptyStr + '");';
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in Insert", err);
        } else {
            console.log('data saved');
            response.id= result.insertId;
        }
        res.send(response);
    });
}

var createCube = function(req, res){
    var name = req.body.name;
    var user_id = req.params.user_id;
    var response = {
        id: -1,
        name: name,
        user_id: user_id
    };
    // save data in table
    var sql = 'INSERT INTO ' + dbconfig.cubes + ' (user_id, name, content) VALUES (' + user_id + ',"' + name + '","' + emptyStr + '");';
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in Insert", err);
            res.send(response);
        } else {
            response.id = result.insertId;
            CopyCubeToUser(req, res, result.insertId, response);
        }
    });
}

var CopyCubeToUser = function(req, res, cube_id, response){
    var user_id = req.params.user_id;
    
    var sql = 'SELECT cubes FROM ' + dbconfig.user + ' WHERE id=' + user_id;
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in select", err);
            res.send(err);
        } else {
            console.log("content: ",result);
            result = JSON.stringify(result);
            result = JSON.parse(result);
            if(result.length)
                UpdateCubeInUser(req, res, user_id, result[0].cubes, cube_id, response);
            else
                UpdateCubeInUser(req, res, user_id, "", cube_id, response);
        }
    });
}

var UpdateCubeInUser = function(req, res, user_id, cubes, cube_id, response){
    if(cubes) 
        cubes = cubes + " " + cube_id;
    else
        cubes = cube_id;
    // save data in table
    var sql = 'UPDATE ' + dbconfig.user + ' SET cubes="' + cubes + '"' + ' WHERE id= ' + user_id;
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in Update", err);
            res.send(err);
        } else {
            console.log('data saved');
            res.send(response);
        }
    });
}
var createContent = function(req, res){
    var link = req.body.link;
    var user_id = req.params.user_id;
    var response = {
        id: -1,
        link: link,
        user_id: user_id
    };
    // save data in table
    var sql = 'INSERT INTO ' + dbconfig.content + ' (user_id, link) VALUES (' + user_id + ',"' + link + '");';
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in Insert", err);
            res.send(response);
        } else {
            response.id= result.insertId;
            CopyContentToUser(req, res, result.insertId, response);
        }
    });
}
var CopyContentToUser = function(req, res, content_id, response){
    var user_id = req.params.user_id;
    
    var sql = 'SELECT content FROM ' + dbconfig.user + ' WHERE id=' + user_id;
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in select", err);
            res.send(err);
        } else {
            console.log("content: ",result);
            result = JSON.stringify(result);
            result = JSON.parse(result);
            if(result.length)
                UpdateContentInUser(req, res, user_id, result[0].content, content_id, response);
            else
                UpdateContentInUser(req, res, user_id, "", content_id, response);
        }
    });
}

var UpdateContentInUser = function(req, res, user_id, content, content_id, response){
    if(content)
        content = content + " " + content_id;
    else
        content = content_id;
    // save data in table
    var sql = 'UPDATE ' + dbconfig.user + ' SET content="' + content + '"' + ' WHERE id= ' + user_id;
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in Update", err);
            res.send(err);
        } else {
            console.log('data saved');
            res.send(response);
        }
    });
}

var addContentToCube = function(req, res){
    var cube_id = req.params.cube_id;
    
    var sql = 'SELECT content FROM ' + dbconfig.cubes + ' WHERE id=' + cube_id;
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in select", err);
            res.send(err);
        } else {
            console.log("content: ",result);
            result = JSON.stringify(result);
            result = JSON.parse(result);
            var content="";
            if(result.length != 0)
                content = result[0].content;
            addToCube(req, res, content, cube_id);
        }
    });
}
var addToCube = function(req, res, content, cube_id){
    var content_id = req.body.content_id;      
    var response = {
        cube_id: cube_id,
        content_id: content_id
    };  
    
    var new_content = content + " " + content_id;
    // save data in table
    var sql = 'UPDATE ' + dbconfig.cubes + ' SET content="' + new_content + '"' + ' WHERE id= ' + cube_id;
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in Update", err);
            res.send(err);
        } else {
            console.log('data saved');
            res.send(response);
        }
    });
}

var removeContentFromCube = function(req, res){
    var cube_id = req.params.cube_id;
    
    var sql = 'SELECT content FROM ' + dbconfig.cubes + ' WHERE id=' + cube_id;
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in select", err);
            res.send(err);
        } else {
            console.log("content: ",result);
            result = JSON.stringify(result);
            result = JSON.parse(result);
            addToCube(req, res, result[0].content, cube_id);
        }
    });
}

var removeFromCube = function(req, res, content, cube_id){
    var content_id = req.body.content_id;        
    content = content.split(' ');
    var match = 0;
    for(var i=0; i < content.length; i++){
        if(content[i] == content_id.toString()){
            match = i;
            i = content.length;
        }
    }
    var new_content = "";
    for(var i=0; i < content.length-1; i++){
        if(i != match){
            new_content = new_content + " " + content[i];
        }
    }
    // save data in table
    var sql = 'UPDATE ' + dbconfig.cubes + ' SET content="' + new_content + '"' + ' WHERE id= ' + cube_id;
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in Update", err);
            res.send(err);
        } else {
            console.log('data saved');
            res.send("success");
        }
    });
}

var deleteCube = function(req, res){
    var cube_id = req.params.cube_id;
    
    var sql = 'DELETE FROM ' + dbconfig.cubes + ' WHERE id=' + cube_id;
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in select", err);
            res.send(err);
        } else {
            res.send("success");
        }
    });
}

var shareCube = function(req, res){
    var user_id = req.body.user_id;
    
    var sql = 'SELECT cubes FROM ' + dbconfig.user + ' WHERE id=' + user_id;
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in select", err);
            res.send(err);
        } else {
            console.log("content: ",result);
            result = JSON.stringify(result);
            result = JSON.parse(result);
            console.log("content2: ",result);
            if(result.length)
                updateShareCube(req, res, result[0].cubes);
            else
                updateShareCube(req, res, "");
        }
    });
}
var updateShareCube = function(req, res, cubes){
    var cube_id = req.params.cube_id;
    
    var sql = 'SELECT shared FROM ' + dbconfig.cubes + ' WHERE id=' + cube_id;
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in select", err);
            res.send(err);
        } else {
            console.log(" share: ",result);
            result = JSON.stringify(result);
            result = JSON.parse(result);
            console.log(" share2: ",result);
            if(result.length)
                addToShare(req, res, cubes, result[0].shared);
            else
                addToShare(req, res, cubes, "");
        }
    });
}

var addToShare = function(req, res, cubes, shares){
    var cube_id = req.params.cube_id;
    var user_id = req.body.user_id;
    
    if(shares)
        shares = shares + " " + cube_id;
    else
        shares = cube_id;
    // save data in table
    var sql = 'UPDATE ' + dbconfig.cubes + ' SET shared="' + shares + '"' + ' WHERE id= ' + cube_id;
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in Update", err);
            res.send(err);
        } else {
            console.log('data saved');
            addCubeToUser(req, res, cubes);
        }
    });
}                     
                     
var addCubeToUser = function(req, res, content){
    var cube_id = req.params.cube_id;
    var user_id = req.body.user_id;
    
    var response = {
        cube_id: cube_id,
        user_id: user_id
    };  

    var cubes;
    if(content)
        cubes = content + " " + cube_id;
    else
        cubes = cube_id;
    // save data in table
    var sql = 'UPDATE ' + dbconfig.user + ' SET cubes="' + cubes + '"' + ' WHERE id= ' + user_id;
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in Update", err);
            res.send(err);
        } else {
            console.log('data saved');
            res.send(response);
        }
    });
}

var shareContent = function(req, res){
    var user_id = req.body.user_id;
    
    var sql = 'SELECT content FROM ' + dbconfig.user + ' WHERE id=' + user_id;
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in select", err);
            res.send(err);
        } else {
            console.log("content: ",result);
            result = JSON.stringify(result);
            result = JSON.parse(result);
            if(result.length)
                addContUser(req, res, result[0].content);
            else
                addContUser(req, res, "");
        }
    });
}

var addContUser = function(req, res, content){
    var content_id = req.params.content_id;
    var user_id = req.body.user_id;
    
    var response = {
        content_id: content_id,
        user_id: user_id
    };  

    var new_content;
    if(content)
        new_content = content + " " + content_id;
    else
        new_content = content_id;
    // save data in table
    var sql = 'UPDATE ' + dbconfig.user + ' SET content="' + new_content + '"' + ' WHERE id= ' + user_id;
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in Update", err);
            res.send(err);
        } else {
            console.log('data saved');
            res.send(response);
        }
    });
}

var listCubes = function(req, res){
    var user_id = req.params.user_id;
    
    var sql = 'SELECT cubes FROM ' + dbconfig.user + ' WHERE id=' + user_id;
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in select", err);
            res.send(err);
        } else {
            console.log("cube list: ",result);
            result = JSON.stringify(result);
            result = JSON.parse(result);
            getMultipleCubes(req, res, result[0].cubes);
        }
    });
}

var getMultipleCubes = function(req, res, cubes){
    cubes = cubes.split(' ');
    var cube_list="";
    for(var i=0; i<cubes.length-1; i++){
        cube_list = "'" + cubes[i] + "'" + "," + cube_list; 
    }
    cube_list = cube_list + "'" + cubes[cubes.length-1] + "'";
    console.log("cubes: ", cube_list);
    var sql = 'SELECT * FROM ' + dbconfig.cubes + ' WHERE id IN(' + cube_list + ')';
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in select", err);
            res.send(err);
        } else {
            console.log("Multiple cubes: ",result);
            res.send(result);
        }
    });
}

var listContent = function(req, res){
    var user_id = req.params.user_id;
    
    var sql = 'SELECT * FROM ' + dbconfig.user + ' WHERE id=' + user_id;
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in select", err);
            res.send(err);
        } else {
            console.log("user content list: ",result);
            result = JSON.stringify(result);
            result = JSON.parse(result);
            cubeUnion(req, res, result[0].cubes, result[0].content);
        }
    });
}

var cubeUnion = function(req, res, cubes, contents){
    cubes = cubes.split(' ');
    var cube_list="";
    for(var i=0; i<cubes.length-1; i++){
        cube_list = "'" + cubes[i] + "'" + "," + cube_list; 
    }
    cube_list = cube_list + "'" + cubes[cubes.length-1] + "'";
    console.log("cubes: ", cube_list);
    var sql = 'SELECT * FROM ' + dbconfig.cubes + ' WHERE id IN(' + cube_list + ')';
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in select", err);
            res.send(err);
        } else {
            console.log("cube union : ",result);
            result = JSON.stringify(result);
            result = JSON.parse(result);
            var list = [];
            var content_list = [];
            for(var i=0; i<result.length; i++){
                list= (result[i].content).split(' ');
                for(var j=0; j<list.length; j++){
                    list[j] = parseInt(list[j]);
                    if(content_list.length != 0){
                        var present = 0;
                        for(var z=0; z<content_list.length; z++){
                            if(content_list[z] == list[j])
                                present = 1;
                        }
                        if(present == 0){
                            content_list.push(list[j]);
                        }
                    }else{
                        content_list.push(list[j]);
                    }
                }
                
            }
            contentUnionWithCubes(req, res, content_list, contents);
        }
    });
}

var contentUnionWithCubes = function(req, res, content_list, contents){
    contents = contents.split(' ');
    for(var i=0; i<contents.length; i++){
        contents[i] = parseInt(contents[i]);
        var present = 0;
        for(var j=0; j<content_list.length; j++){
            if(content_list[j] == contents[i])
                present = 1;
        }
        if(present == 0)
            content_list.push(contents[i]);
    }
    var search_str="";
    for(var i=0; i<content_list.length; i++){
        if(i)
            search_str =  search_str  + "," + "'" + content_list[i] + "'";
        else
            search_str =  "'" + content_list[i] + "'";
    }
    console.log("search str: ", search_str);
    var sql = 'SELECT * FROM ' + dbconfig.content + ' WHERE id IN(' + search_str + ')';
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("error in select", err);
            res.send(err);
        } else {
            console.log("Multiple content: ",result);
            res.send(result);
        }
    });
}
module.exports = {
    createUser: createUser,
    createCube: createCube,
    createContent: createContent,
    addContentToCube: addContentToCube,
    addToCube: addToCube,
    removeContentFromCube: removeContentFromCube,
    removeFromCube: removeFromCube,
    deleteCube: deleteCube,
    shareCube: shareCube,
    addCubeToUser: addCubeToUser,
    shareContent: shareContent,
    addContUser: addContUser,
    listCubes: listCubes,
    listContent: listContent,
    cubeUnion: cubeUnion,
    contentUnionWithCubes: contentUnionWithCubes
}