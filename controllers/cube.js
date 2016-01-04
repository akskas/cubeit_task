'use strict';

var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);
//// console.log('Database connection ', connection.config.host +" "+connection.config.port);

/*
  ** Database is divided into 3 tables (user, cubes, content)
   *'user' table contains user's data and two extra fields 'cubes' and 'content' to save cubes and content associated with a user
   *'cubes' table contains cube's name and 'content' column to save contents associated with a cube. 'Shared' column contains list of 
        users with which that cube is shared. This is helpful while deleting a cube since we have to delete it from 'user' tables 'cubes' column 
   *'content' table contains list of all contents    
*/

var emptyStr = "";

/* 
  1. This method creates a user in 'user' table
*/
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
            // console.log("error in Insert", err);
            res.send(response);
        } else {
            // console.log('data saved');
            response.id= result.insertId;
            console.log("\n\nresponse: ", response);
            res.send(response);
        } 
    });
}

/*
    2. For creating a cube
       creates a cube in 'cubes' table and then updates the 'cubes' column of 'user' table by adding this cube's id
*/
var createCube = function(req, res){  //create a cube in 'cubes' table
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
            // console.log("error in Insert", err);
            res.send(response);
        } else {
            response.id = result.insertId;
            CopyCubeToUser(req, res, result.insertId, response);
        }
    });
}
var CopyCubeToUser = function(req, res, cube_id, response){   // gets cubes row data from user table
    var user_id = req.params.user_id;
    
    var sql = 'SELECT cubes FROM ' + dbconfig.user + ' WHERE id=' + user_id;
    connection.query(sql, function (err, result) {
        if (err) {
            // console.log("error in select", err);
            res.send(err);
        } else {
            // console.log("content: ",result);
            result = JSON.stringify(result);
            result = JSON.parse(result);
            if(result.length)
                UpdateCubeInUser(req, res, user_id, result[0].cubes, cube_id, response);
            else
                UpdateCubeInUser(req, res, user_id, "", cube_id, response);
        }
    });
}
var UpdateCubeInUser = function(req, res, user_id, cubes, cube_id, response){   // updates cubes row in user table
    if(cubes) 
        cubes = cubes + " " + cube_id;
    else
        cubes = cube_id;
    // save data in table
    var sql = 'UPDATE ' + dbconfig.user + ' SET cubes="' + cubes + '"' + ' WHERE id= ' + user_id;
    connection.query(sql, function (err, result) {
        if (err) {
            // console.log("error in Update", err);
            res.send(err);
        } else {
            // console.log('data saved');
            console.log("\n\nresponse: ", response);
            res.send(response);
        }
    });
}

/*
    3. For creating a content
       creates a content in 'content' table and then updates the 'content' column of 'user' table by adding this content's id
*/
var createContent = function(req, res){ // creates a content row in 'content' table
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
            // console.log("error in Insert", err);
            res.send(response);
        } else {
            response.id= result.insertId;
            CopyContentToUser(req, res, result.insertId, response);
        }
    });
}
var CopyContentToUser = function(req, res, content_id, response){  // get content colum data of corresponding user
    var user_id = req.params.user_id;
    
    var sql = 'SELECT content FROM ' + dbconfig.user + ' WHERE id=' + user_id;
    connection.query(sql, function (err, result) {
        if (err) {
            // console.log("error in select", err);
            res.send(err);
        } else {
            // console.log("content: ",result);
            result = JSON.stringify(result);
            result = JSON.parse(result);
            if(result.length)
                UpdateContentInUser(req, res, user_id, result[0].content, content_id, response);
            else
                UpdateContentInUser(req, res, user_id, "", content_id, response);
        }
    });
}
var UpdateContentInUser = function(req, res, user_id, content, content_id, response){  //updates content list 
    if(content)
        content = content + " " + content_id;
    else
        content = content_id;
    // save data in table
    var sql = 'UPDATE ' + dbconfig.user + ' SET content="' + content + '"' + ' WHERE id= ' + user_id;
    connection.query(sql, function (err, result) {
        if (err) {
            // console.log("error in Update", err);
            res.send(err);
        } else {
            // console.log('data saved');
            console.log("\n\nresponse: ", response);
            res.send(response);
        }
    });
}

/*
    4. For adding a content to a cube
       gets content list of corresponding cube and updates it 
*/
var addContentToCube = function(req, res){ //gets content list 
    var cube_id = req.params.cube_id;
    
    var sql = 'SELECT content FROM ' + dbconfig.cubes + ' WHERE id=' + cube_id;
    connection.query(sql, function (err, result) {
        if (err) {
            // console.log("error in select", err);
            res.send(err);
        } else {
            // console.log("content: ",result);
            result = JSON.stringify(result);
            result = JSON.parse(result);
            var content="";
            if(result.length != 0)
                content = result[0].content;
            addToCube(req, res, content, cube_id);
        }
    });
}
var addToCube = function(req, res, content, cube_id){  // update cube with new content list
    var content_id = req.body.content_id;      
    var response = {
        cube_id: cube_id,
        content_id: content_id
    };  
    
    var new_content;
    if(content)
        new_content = content + " " + content_id;
    else
        new_content = content_id;
    // save data in table
    var sql = 'UPDATE ' + dbconfig.cubes + ' SET content="' + new_content + '"' + ' WHERE id= ' + cube_id;
    connection.query(sql, function (err, result) {
        if (err) {
            // console.log("error in Update", err);
            res.send(err);
        } else {
            // console.log('data saved');
            console.log("\n\nresponse: ", response);
            res.send(response);
        }
    });
}

/*
    5. For deleting a content from a cube
       gets content list of corresponding cube and removes it from list 
*/
var removeContentFromCube = function(req, res){  //get content list for corresponding cube
    var cube_id = req.params.cube_id;
    
    var sql = 'SELECT content FROM ' + dbconfig.cubes + ' WHERE id=' + cube_id;
    connection.query(sql, function (err, result) {
        if (err) {
            // console.log("error in select", err);
            res.send(err);
        } else {
            // console.log("content: ",result);
            result = JSON.stringify(result);
            result = JSON.parse(result);
            removeFromCube(req, res, result[0].content, cube_id);
        }
    });
}
var removeFromCube = function(req, res, content, cube_id){  //updates content list
    var content_id = req.params.content_id;        
    content = content.split(' ');
    var match = 0;
    for(var i=0; i < content.length; i++){
        if(content[i] == content_id.toString()){
            match = i;
            i = content.length;
        }
    }
    var new_content = "";
    for(var i=0; i < content.length; i++){
        if(i != match){
            if(new_content)
                new_content = new_content + " " + content[i];
            else
                new_content = content[i];
        }
    }
    // save data in table
    var sql = 'UPDATE ' + dbconfig.cubes + ' SET content="' + new_content + '"' + ' WHERE id= ' + cube_id;
    connection.query(sql, function (err, result) {
        if (err) {
            // console.log("error in Update", err);
            res.send(err);
        } else {
            // console.log('data saved');
            console.log("\n\nresponse: NULL");
            res.send();
        }
    });
}

/*
    6. For deleting a cube
       gets list of users with which corresponding cube is shared **
       deletes the corresponding cube from 'cubes' table
       gets cubes list of all the users with which cube is shared (** we already have list of shared users from first query)
       updates the 'cubes' fields of all the shared users 
*/
var deleteCube = function(req, res){ //gets list of users with which corresponding cube is shared
    var cube_id = req.params.cube_id;
    
    var sql = 'SELECT * FROM ' + dbconfig.cubes + ' WHERE id=' + cube_id;
    connection.query(sql, function (err, result) {
        if (err) {
            // console.log("error in select", err);
            res.send(err);
        } else {
            // console.log("content: ",result);
            result = JSON.stringify(result);
            result = JSON.parse(result);
            // console.log("content2: ",result);
            if(result.length)
                deleteFromCube(req, res, result[0].shared , cube_id, result[0].user_id);
            else{
                var response = {message: "cube doest not exits"};
                res.send(response);
            }
        }
    });   
}
var deleteFromCube = function(req, res, shared, cube_id, creater_id){   //deletes the corresponding cube from 'cubes' table
    var sql = 'DELETE FROM ' + dbconfig.cubes + ' WHERE id=' + cube_id;
    connection.query(sql, function (err, result) {
        if (err) {
            // console.log("error in select", err);
            res.send(err);
        } else {
            getFromShared(req, res, shared, cube_id, creater_id);
        }
    });
}
var getFromShared = function(req, res, shared, cube_id, creater_id){  //gets cubes list of all the users with which cube is shared 
    shared = shared.split(' ');                                       // and the creater of cube 
    shared.push(creater_id);
    var search_str="";
    for(var i=0; i<shared.length; i++){
        if(i)
            search_str =  search_str  + "," + "'" + shared[i] + "'";
        else
            search_str =  "'" + shared[i] + "'";
    }
//    search_str = search_str + "," + "'" + creater_id + "'";
    // console.log("shared search str: ", search_str);
    var sql = 'SELECT cubes FROM ' + dbconfig.user + ' WHERE id IN(' + search_str + ')';
    connection.query(sql, function (err, result) {
        if (err) {
            // console.log("error in select", err);
            res.send(err);
        } else {
            result = JSON.stringify(result);
            result = JSON.parse(result);
            // console.log("cubes list: ", result);
            for(var i=0; i<result.length; i++){
                deleteFromShared(req, res, cube_id, result[i].cubes, shared[i]);
                if(i == result.length-1){
                    console.log("\n\nresponse: NULL");
                    res.send();
                }
            }
        }
    });
}
var deleteFromShared = function(req, res, cube_id, cubes, shared_id){  // updates the 'cubes' fields of shared users and creater of cube
    // console.log("cube_id: " + cube_id + " cubes: " + cubes + " shared_id: " + shared_id);
    cubes = cubes.split(' ');
    var match = 0;
    for(var i=0; i < cubes.length; i++){
        if(cubes[i] == shared_id.toString()){
            match = i;
            i = cubes.length;
        }
    }
    // console.log("match: ", match);
    var new_cubes = "";
    for(var i=0; i < cubes.length; i++){
        if(i != match){
            if(new_cubes)
                new_cubes = new_cubes + " " + cubes[i];
            else
                new_cubes = cubes[i];
        }
    }
    // save data in table
    var sql = 'UPDATE ' + dbconfig.user + ' SET cubes="' + new_cubes + '"' + ' WHERE id= ' + shared_id;
    connection.query(sql, function (err, result) {
        if (err) {
            // console.log("error in Update", err);
        } else {
            // console.log('data saved');
        }
    });
}

/*
    7. For sharing a cube with other user
       gets cubes list from shared user  
       gets shared list of corresponding cube
       updates 'shared' field of corresponding cube, adds shared user in the list
       adds cube to the cube list of shared user
*/
var shareCube = function(req, res){  //gets cubes list from shared user
    var user_id = req.body.user_id;
    
    var sql = 'SELECT cubes FROM ' + dbconfig.user + ' WHERE id=' + user_id;
    connection.query(sql, function (err, result) {
        if (err) {
            // console.log("error in select", err);
            res.send(err);
        } else {
            // console.log("content: ",result);
            result = JSON.stringify(result);
            result = JSON.parse(result);
            // console.log("content2: ",result);
            if(result.length)
                updateShareCube(req, res, result[0].cubes);
            else
                updateShareCube(req, res, "");
        }
    });
}
var updateShareCube = function(req, res, cubes){    //gets shared list of corresponding cube
    var cube_id = req.params.cube_id;
    
    var sql = 'SELECT shared FROM ' + dbconfig.cubes + ' WHERE id=' + cube_id;
    connection.query(sql, function (err, result) {
        if (err) {
            // console.log("error in select", err);
            res.send(err);
        } else {
            // console.log(" share: ",result);
            result = JSON.stringify(result);
            result = JSON.parse(result);
            // console.log(" share2: ",result);
            if(result.length)
                addToShare(req, res, cubes, result[0].shared);
            else
                addToShare(req, res, cubes, "");
        }
    });
}
var addToShare = function(req, res, cubes, shares){ //updates 'shared' field of corresponding cube, adds shared user in the list
    var cube_id = req.params.cube_id;
    var user_id = req.body.user_id;
    
    if(shares)
        shares = shares + " " + user_id;
    else
        shares = user_id;
    // save data in table
    var sql = 'UPDATE ' + dbconfig.cubes + ' SET shared="' + shares + '"' + ' WHERE id= ' + cube_id;
    connection.query(sql, function (err, result) {
        if (err) {
            // console.log("error in Update", err);
            res.send(err);
        } else {
            // console.log('data saved');
            addCubeToUser(req, res, cubes);
        }
    });
}                     
var addCubeToUser = function(req, res, content){ //adds cube to the cube list of shared user
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
            // console.log("error in Update", err);
            res.send(err);
        } else {
            // console.log('data saved');
            console.log("\n\nresponse: ", response);
            res.send(response);
        }
    });
}

/*
    8. For sharing a content with other user
       gets content list of shared user
       adds corresponding content in the list
*/
var shareContent = function(req, res){  //gets content list of shared user
    var user_id = req.body.user_id;
    
    var sql = 'SELECT content FROM ' + dbconfig.user + ' WHERE id=' + user_id;
    connection.query(sql, function (err, result) {
        if (err) {
            // console.log("error in select", err);
            res.send(err);
        } else {
            // console.log("content: ",result);
            result = JSON.stringify(result);
            result = JSON.parse(result);
            if(result.length)
                addContUser(req, res, result[0].content);
            else
                addContUser(req, res, "");
        }
    });
}
var addContUser = function(req, res, content){ //adds corresponding content in the list
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
            // console.log("error in Update", err);
            res.send(err);
        } else {
            // console.log('data saved');
            console.log("\n\nresponse: ", response);
            res.send(response);
        }
    });
}

/*
    9. For listing all cube of a user
       gets cubes list of user
       searches all the cubes with corresponding cubes in cubes list
*/
var listCubes = function(req, res){ //gets cubes list of user
    var user_id = req.params.user_id;
    
    var sql = 'SELECT cubes FROM ' + dbconfig.user + ' WHERE id=' + user_id;
    connection.query(sql, function (err, result) {
        if (err) {
            // console.log("error in select", err);
            res.send(err);
        } else {
            // console.log("cube list: ",result);
            result = JSON.stringify(result);
            result = JSON.parse(result);
            getMultipleCubes(req, res, result[0].cubes);
        }
    });
}
var getMultipleCubes = function(req, res, cubes){  //searches all the cubes with corresponding cubes in cubes list
    cubes = cubes.split(' ');
    var cube_list="";
    for(var i=0; i<cubes.length-1; i++){
        cube_list = "'" + cubes[i] + "'" + "," + cube_list; 
    }
    cube_list = cube_list + "'" + cubes[cubes.length-1] + "'";
    // console.log("cubes: ", cube_list);
    var sql = 'SELECT * FROM ' + dbconfig.cubes + ' WHERE id IN(' + cube_list + ')';
    connection.query(sql, function (err, result) {
        if (err) {
            // console.log("error in select", err);
            res.send(err);
        } else {
            // console.log("Multiple cubes: ",result);
            result = JSON.stringify(result);
            result = JSON.parse(result);
            console.log("\n\nresponse: ", result);
            res.send(result);
        }
    });
}

/*
    10. For listing all contents of a user
        gets cubes list of user
        takes the union of all the contents in all cubes in cube list
        takes union of above content list with content data obtained from 'content' column of user 
*/
var listContent = function(req, res){ //gets cubes list of user
    var user_id = req.params.user_id;
    
    var sql = 'SELECT * FROM ' + dbconfig.user + ' WHERE id=' + user_id;
    connection.query(sql, function (err, result) {
        if (err) {
            // console.log("error in select", err);
            res.send(err);
        } else {
            // console.log("user content list: ",result);
            result = JSON.stringify(result);
            result = JSON.parse(result);
            cubeUnion(req, res, result[0].cubes, result[0].content);
        }
    });
}
var cubeUnion = function(req, res, cubes, contents){ //takes the union of all the contents in all cubes in cube list
    cubes = cubes.split(' ');
    var cube_list="";
    for(var i=0; i<cubes.length-1; i++){
        cube_list = "'" + cubes[i] + "'" + "," + cube_list; 
    }
    cube_list = cube_list + "'" + cubes[cubes.length-1] + "'";
    // console.log("cubes: ", cube_list);
    var sql = 'SELECT * FROM ' + dbconfig.cubes + ' WHERE id IN(' + cube_list + ')';
    connection.query(sql, function (err, result) {
        if (err) {
            // console.log("error in select", err);
            res.send(err);
        } else {
            // console.log("cube union : ",result);
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
var contentUnionWithCubes = function(req, res, content_list, contents){ // takes union of above content list with content data obtained from 'content' column of user 
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
    // console.log("search str: ", search_str);
    var sql = 'SELECT * FROM ' + dbconfig.content + ' WHERE id IN(' + search_str + ')';
    connection.query(sql, function (err, result) {
        if (err) {
            // console.log("error in select", err);
            res.send(err);
        } else {
            // console.log("Multiple content: ",result);
            result = JSON.stringify(result);
            result = JSON.parse(result);
            console.log("\n\nresponse: ", result);
            res.send(result);
        }
    });
}


// export modules
module.exports = {
    createUser: createUser,
    createCube: createCube,
    createContent: createContent,
    addContentToCube: addContentToCube,
    removeContentFromCube: removeContentFromCube,
    deleteCube: deleteCube,
    shareCube: shareCube,
    shareContent: shareContent,
    listCubes: listCubes,
    listContent: listContent,
   
}