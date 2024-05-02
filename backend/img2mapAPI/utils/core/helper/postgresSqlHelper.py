# This will handle cration of the database and needed tables.
# """
#
# Path: backend/img2mapAPI/utils/core/helper/postgresSqlHelper.py

import psycopg2
import os
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from psycopg2.errors import DuplicateTable

_LocalSSLMODE = 'require'

async def createDB(dnsString: str, datname: str = 'img2map'):
    """Create a database if it does not exist

    Args:
        database_url (str): Connection string to the database
        datname (str, optional): Name for the database. Defaults to 'img2map'.
    """
    #check if the database exists, if not create it
    conn = psycopg2.connect(dnsString, sslmode=_LocalSSLMODE)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (datname,))
    exists = cur.fetchone()
    if not exists:
        cur.execute("CREATE DATABASE %s", (datname,))
    cur.close()
    conn.close()

async def createTable(dnsString: str, sql: str):
    """Create a table in the database

    Args:
        datbase_url (str): Connection string to the database
        sql (str): The sql query to create the table
    """
    conn = psycopg2.connect(dnsString, sslmode=_LocalSSLMODE)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    try:
        cur.execute(sql)
    except DuplicateTable:
        pass
    cur.close()
    conn.close()


