* public folder is for testing the controllers only 
  it can be deleted once we have integrated routes with front-end

* get '/' route is used for rendering html files

* database we have to create using command line.
  1. install mysql
  2. open terminal
  3. write: mysql -u root -p
  4. give your password
  5. type: CREATE DATABASE Resto;    ** Do not forget semicolon
  6. now to create table(s) hit respective route(s) in postman
  
  
  *DATABASE Connection
  
  1. login as root: mysql -u root -p
  2. create user: CREATE USER 'resto'@'localhost' IDENTIFIED BY 'resto';
  3. Grant permission: GRANT ALL ON *.* TO 'resto'@localhost WITH GRANT OPTION;