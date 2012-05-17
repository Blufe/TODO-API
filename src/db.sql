CREATE DATABASE TESTDB;
CREATE TABLE list (
	id int(10) NOT NULL auto_increment,
	name char(20) DEFAULT '' NOT NULL,
	memo char(240) DEFAULT '',
	PRIMARY KEY (id),
	KEY k_name (name));
;;;