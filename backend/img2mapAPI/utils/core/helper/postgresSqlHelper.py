# This will handle cration of the database and needed tables.
# """
#
# Path: backend/img2mapAPI/utils/core/helper/postgresSqlHelper.py

import psycopg2
import os
from psycopg2 import sql
from psycopg2.extras import DictCursor
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from psycopg2.errors import DuplicateTable


def createDB(dbname: str, user: str, password: str, host: str, port: str):
    #check if the database exists, if not create it
    conn = psycopg2.connect(dbname='postgres', user=user, password=password, host=host, port=port)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    cur.execute(sql.SQL("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s"), [dbname])
    exists = cur.fetchone()
    if not exists:
        cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(dbname)))
    cur.close()
    conn.close()

def createTable(dbname: str, user: str, password: str, host: str, port: str, table_name: str, columns: dict):
    conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host, port=port)
    cur = conn.cursor()
    columns_str = ', '.join([f"{k} {v}" for k, v in columns.items()])
    try:
        cur.execute(sql.SQL(f"CREATE TABLE {table_name} ({columns_str})"))
    except DuplicateTable:
        pass
    conn.commit()
    cur.close()
    conn.close()

