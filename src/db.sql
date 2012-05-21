DROP DATABASE IF EXISTS TODODB;
CREATE DATABASE TODODB DEFAULT CHARACTER SET utf8;
DROP TABLE IF EXISTS TODODB.todo;
CREATE TABLE TODODB.todo (
	t_id int(10) NOT NULL auto_increment,
	name char(20) NOT NULL,
	memo char(240) DEFAULT '',
	date datetime DEFAULT '00000000000' NOT NULL,
	PRIMARY KEY (t_id),
	KEY k_name (name));
DROP TABLE IF EXISTS TODODB.word;
CREATE TABLE TODODB.word (
	w_id int(10) NOT NULL auto_increment,
	type char(10) DEFAULT 'other' NOT NULL,
	word char(240) NOT NULL,
	PRIMARY KEY (w_id));
DROP TABLE IF EXISTS TODODB.list;
CREATE TABLE TODODB.list (
	id int(100) NOT NULL auto_increment,
	t_id int(10) NOT NULL,
	w_id int(10) NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (t_id) REFERENCES todo (t_id),
	FOREIGN KEY (w_id) REFERENCES word (w_id));
