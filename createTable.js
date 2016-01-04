// server.js 

    // set up ========================
    var express  = require('express');
    var app = module.exports = express();                               // create our app w/ express
    var PORT = 9100;

    app.get('/', function(req, res){ 
        res.render('index');
    });
    // create table
    var mysql = require('mysql');
    var dbconfig = require('./config/database');
    var connection = mysql.createConnection(dbconfig.connection);
    console.log('Database connection ', connection.config.host +" "+connection.config.port);
    
    /*
        Code for creating user table starts
    */
    var sql = 'SHOW TABLES LIKE "'+ dbconfig.user +'"';
    connection.query(sql, function(err, result){
        console.log("result: ", result);
        if(err)
            console.log("Error in showing user table", err);
        else
            create_user(result);
        
    });
    // tables is the result of search query
    var create_user =  function(tables){  
        if(tables.length == 0){
            var sql2 = 'CREATE TABLE user (id INT NOT NULL AUTO_INCREMENT,name VARCHAR(255), city VARCHAR(255), cubes TEXT, content TEXT, PRIMARY KEY (id))';
            connection.query(sql2, function(err, result){
                // Case there is an error during the creation
                if(err) {
                    console.log("Error in table creation", err);
                }
                else{
                    console.log("table created " , dbconfig.user);
                }
            });    
        }else{
            console.log("table already created: ", dbconfig.user);
        }
    };

    /*
        Code for creating user table Ends
    */

    /*
        Code for creating cubes table starts
    */
    var sql3 = 'SHOW TABLES LIKE "'+ dbconfig.cubes +'"';
    connection.query(sql3, function(err, result){
        console.log("result: ", result);
        if(err)
            console.log("Error in showing cubes table", err);
        else
            create_cubes(result);
        
    });
    // tables is the result of search query
    var create_cubes =  function(tables){  
        if(tables.length == 0){
            var sql4 = 'CREATE TABLE cubes (id INT NOT NULL AUTO_INCREMENT,user_id INT, name VARCHAR(255), content TEXT, shared TEXT, PRIMARY KEY (id))';
            connection.query(sql4, function(err, result){
                // Case there is an error during the creation
                if(err) {
                    console.log("Error in table creation", err);
                }
                else{
                    console.log("table created " , dbconfig.cubes);
                }
            });    
        }else{
            console.log("table already created: ", dbconfig.cubes);
        }
    };

    /*
        Code for creating cubes table Ends
    */

    /*
        Code for creating content table starts
    */
    var sql5 = 'SHOW TABLES LIKE "'+ dbconfig.content +'"';
    connection.query(sql5, function(err, result){
        console.log("result: ", result);
        if(err)
            console.log("Error in showing content table", err);
        else
            create_content(result);
        
    });
    // tables is the result of search query
    var create_content =  function(tables){  
        if(tables.length == 0){
            var sql6 = 'CREATE TABLE content (id INT NOT NULL AUTO_INCREMENT,user_id INT, link VARCHAR(255), PRIMARY KEY (id))';
            connection.query(sql6, function(err, result){
                // Case there is an error during the creation
                if(err) {
                    console.log("Error in table creation", err);
                }
                else{
                    console.log("table created " , dbconfig.content);
                }
            });    
        }else{
            console.log("table already created: ", dbconfig.content);
        }
    };

    /*
        Code for creating cubes table Ends
    */

    app.listen(PORT, function(){
        console.log('App listening on port', PORT);
    });