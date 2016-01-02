// config/database.js

/*  
* database 
  1. install mysql
  2. open terminal
  3. write: mysql -u root -p
  4. give your password
  5. type: CREATE DATABASE Resto;   
  
 *DATABASE Connection
  
  1. login as root: mysql -u root -p
  2. create user: CREATE USER 'resto'@'localhost' IDENTIFIED BY 'resto';
  3. Grant permission: GRANT ALL ON *.* TO 'resto'@localhost WITH GRANT OPTION;

*/

module.exports = {
    'connection': {
        'host': 'localhost',
        'user': 'resto',
        'password': 'resto',
        'database': 'Resto',
    },
    'user': 'user',     // users data
    'cubes': 'cubes',
    'content': 'content',
};