CREATE DATABASE TESTDB DEFAULT CHARACTER SET utf8;
DROP TABLE IF EXISTS list;
CREATE TABLE list (
	id int(10) NOT NULL auto_increment,
	name char(20) DEFAULT '' NOT NULL,
	memo char(240) DEFAULT '',
	date datetime DEFAULT '00000000000' NOT NULL,
	PRIMARY KEY (id),
	KEY k_name (name));