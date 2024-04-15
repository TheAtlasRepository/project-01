import sqlite3 as sql
from typing import Union
from pydantic import BaseModel
from img2mapAPI.utils.storage.data.storageHandler import StorageHandler as sh
from img2mapAPI.utils.core.helper.sqliteHelper import *

class SQLiteStorage(sh):
    _instance = None
    dbPath = None
    hasSettup = False

    def __init__(self, dbName: str = 'test.sqlite3'):
        self.dbPath = createNewDatabase(dbName)
    
    async def settupDatabase(self):
        #create the database and the tables
        if self.dbPath is None:
            self.dbPath = createNewDatabase('georefProjects.db')
        await self.createTables()
        self.hasSettup = True
    
    async def createTables(self):
        #todo: connect to the database and make cursor
        conn: sql.Connection = await self.connect()
        if conn is None:
            raise Exception('Could not connect to the database')
        cursor = conn.cursor()
        try:
            #create the table for the project
            cursor.execute('''CREATE TABLE IF NOT EXISTS project(
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            name TEXT NOT NULL,
                            description TEXT,
                            crs TEXT,
                            imageFilePath TEXT,
                            georeferencedFilePath TEXT,
                            selfdestructtime TEXT,
                            created TEXT,
                            lastModified TEXT)'''
                            )
            #create the table for the points
            cursor.execute('''CREATE TABLE IF NOT EXISTS point(
                            id INTEGER PRIMARY KEY,
                            projectId INTEGER,
                            Idproj INTEGER NOT NULL,
                            lat REAL NOT NULL,
                            lng REAL NOT NULL,
                            row INTEGER NOT NULL,
                            col INTEGER NOT NULL,
                            error REAL,
                            name TEXT,
                            description TEXT,
                            FOREIGN KEY (projectId) REFERENCES project (id) ON DELETE SET NULL
                           )
                            '''
                            )
            #commit the changes
            conn.commit()
        except Exception as e:
            print(e)
        #close the connection
        conn.close()



    async def connect(self, db: str ='', user: str = '', password: str='', host: str='', port: int=0)->sql.Connection:
        #handle the connection to the database for Sqlite uses only local variables return the connection
        try:
            conn = sql.connect(self.dbPath)
            return conn
        except:
            return None
        
    async def saveInStorage(self, data: BaseModel, type: str, pkName:str = 'id')->int:
        if self.hasSettup is False:
            await self.settupDatabase()
        conn: sql.Connection = await self.connect()
        if conn is not None:
            cursor = conn.cursor()
            try:
                data: dict = dict(data) #convert the data to a dictionary
                #TODO: remove duct tape
                if 'id' in data:
                    del data['id']
                #if the type is project remove 
                if type == 'project':
                    if 'points' in data:
                        del data['points']
                #create the query
                keys = ', '.join(data.keys())
                placeholders = ', '.join(['?' for _ in data])
                query = f"INSERT INTO {type} ({keys}) VALUES ({placeholders})"

                cursor.execute(query, list(data.values()))
                id = cursor.lastrowid #get the id of the saved data
                conn.commit()
                return id
            except Exception as e:
                print(e)
                return None
            finally:
                conn.close()
    
    async def remove(self, id: int, type: str)->None:
        if self.hasSettup is False:
            await self.settupDatabase()
        conn: sql.Connection = await self.connect()
        if conn is not None:
            cursor = conn.cursor()
            try:
                query = f"DELETE FROM {type} WHERE id = {id}"
                cursor.execute(query, ())
                conn.commit()
            except Exception as e:
                print(e)
            finally:
                conn.close()


    async def update(self, id: int, data: BaseModel, type: str)->None:
        if self.hasSettup is False:
            await self.settupDatabase()
        conn: sql.Connection = await self.connect()
        if conn is not None:
            cursor = conn.cursor()
            try:
                data: dict = dict(data) #convert the data to a dictionary
                #as in the save function remove the id and the points
                if 'id' in data:
                    del data['id']
                if type == 'project':
                    if 'points' in data:
                        del data['points']
                #create the query
                keys = ', '.join(data.keys())
                placeholders = ', '.join([f"{key} = ?" for key in data])
                query = f"UPDATE {type} SET {placeholders} WHERE id = {id}"
                cursor.execute(query, list(data.values()))
                conn.commit()
            except Exception as e:
                print(e)
            finally:
                conn.close()
        pass

    async def fetchOne(self, id: int, type: str) -> Union[None, dict]:
        if self.hasSettup is False:
            await self.settupDatabase()
        conn: sql.Connection = await self.connect()
        if conn is not None:
            cursor = conn.cursor()
            try:
                query = f"SELECT * FROM {type} WHERE id = {id}"
                cursor.execute(query, ())
                row = cursor.fetchone()
                if row is not None:
                    ret = self.convertSequenseToDict(row, type)
                    return ret
                else:
                    return None
            except Exception as e:
                print(e)
            finally:
                conn.close()
        pass
    
    async def fetch(self, type: str, params: dict = {})->Union[None ,list, dict]:
        if self.hasSettup is False:
            await self.settupDatabase()
        conn: sql.Connection = await self.connect()
        if conn is not None:
            cursor = conn.cursor()
            try:
                query = f"SELECT * FROM {type} WHERE "
                placeholders = []
                values = []
                for key, value in params.items():
                    query += f"{key} = ? AND "
                    placeholders.append('?')
                    values.append(value)
                query = query[:-4]
                cursor.execute(query, values)
                rows = cursor.fetchall()
                ret = []
                for row in rows:
                    ret.append(self.convertSequenseToDict(row, type))
                return ret
            except Exception as e:
                print(e)
            finally:
                conn.close()
        pass
    
    async def fetchAll(self, type: str)->Union[None, list]:
        if self.hasSettup is False:
            await self.settupDatabase()
        conn: sql.Connection = await self.connect()
        if conn is not None:
            cursor = conn.cursor()
            try:
                query = f"SELECT * FROM {type}"
                cursor.execute(query, ())
                rows = cursor.fetchall()
                ret = []
                for row in rows:
                    ret.append(self.convertSequenseToDict(row, type))
                return ret
            except Exception as e:
                print(e)
            finally:
                conn.close()
        pass
    
    #duct tape solution
    def convertSequenseToDict(self, row: tuple, type: str)->dict:
        if type == 'project':
            return {
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'points': [], #TODO: fix this, this is a duct tape solution
                'crs': row[3],
                'imageFilePath': row[4],
                'georeferencedFilePath': row[5],
                'selfdestructtime': row[6],
                'created': row[7],
                'lastModified': row[8]
            }
        if type == 'point':
            return {
                'id': row[0],
                'projectId': row[1],
                'Idproj': row[2],
                'lat': row[3],
                'lng': row[4],
                'row': row[5],
                'col': row[6],
                'error': row[7],
                'name': row[8],
                'description': row[9]
            }

    def __new__(cls, dbName: str = 'test.db'):
        if cls._instance is None:
            cls._instance = super(SQLiteStorage, cls).__new__(cls)
            cls._instance.__init__(dbName)
        return cls._instance

