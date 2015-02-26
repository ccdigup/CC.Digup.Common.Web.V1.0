 if(digUPSettings.enableIndexedDB){
    var localDB = {};
    window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
      
    if ('webkitIndexedDB' in window) {
        window.IDBTransaction = window.webkitIDBTransaction;
        window.IDBKeyRange = window.webkitIDBKeyRange;
    }
      
    localDB.indexedDB = {};
    localDB.indexedDB.db = null;
      
    localDB.indexedDB.onerror = function(e) {
        //console.log(e);
    };
      

    localDB.indexedDB.open = function(dbName, tables, dbVersion) {
        var request = indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = function(e) {
            localDB.indexedDB.db = e.target.result;
            var db = localDB.indexedDB.db;
            
            $(tables).each(function(tableIndex, table) {
                if(db.objectStoreNames.contains(table.name)) {
                    db.deleteObjectStore(table.name);
                }
      
                var store = db.createObjectStore(table.name, {keyPath: "primaryKey", autoIncrement:false});
                createObjectStores(table.name, store);
            });

        };

        request.onsuccess = function(e) {

            localDB.indexedDB.db = e.target.result;

            $(tables).each(function(tableIndex, table) {
                if(table.name == "settings") {
                    checkUpUserSettings(table);
                }
            });
                
        };
        request.onerror = localDB.indexedDB.onerror;
    };
      
    localDB.indexedDB.addElement = function(data, table, successFunction, errorFunction) {

        var db = localDB.indexedDB.db;
        var trans = db.transaction([table.name], "readwrite");
        var store = trans.objectStore(table.name);
       
        /*for (var i = 0; i < data.length; i++) { 
            request = store.put(data[i]);
        } 
        */
        var request = store.put(data);

        request.onsuccess = function(e) {
            if(!stringIsNullOrEmpty(successFunction)) {
                successFunction(data);
            }
            //localDB.indexedDB.getAllTableElements(table);
        };
      
        request.onerror = function(e) {
            if(e.target.error.name == "ConstraintError")
                errorFunction();
            
            //console.log("Error Adding: ", e);
        };
    };

    localDB.indexedDB.getTableElementByTag = function getByTag(table, value, columnName, successFunction) {

        var db = localDB.indexedDB.db;

        var trans = db.transaction([table.name], "readonly");
        var objectStore = trans.objectStore(table.name);

        var index = objectStore.index(columnName);
        var request = index.get(value);

        request.onsuccess = function(e) {
            successFunction(e.target.result);
        };
    };

    localDB.indexedDB.updateElement = function(oldData, table, successFunction, errorFunction) {
        var db = localDB.indexedDB.db;
        var trans = db.transaction([table.name], "readwrite");
        var store = trans.objectStore(table.name);
        
        var request = store.delete(oldData.primaryKey);
        
        request.onsuccess = function(e) {
            var addElementResult = store.put(oldData);

            addElementResult.onsuccess = function(ev) {
                if(!stringIsNullOrEmpty(successFunction)) {
                    successFunction(ev);
                }
            };
      
            addElementResult.onerror = function(ex) {
                if(ex.target.error.name == "ConstraintError")
                    errorFunction();
                
                //console.log("Error Adding: ", ex);
            };
        };

        request.onerror = localDB.indexedDB.onerror;
    };
      
    localDB.indexedDB.deleteElement = function(id, table) {
        var db = localDB.indexedDB.db;
        var trans = db.transaction([table.name], "readwrite");
        var store = trans.objectStore(table.name);
      
        var request = store.delete(id);
      
//        request.onsuccess = function(e) {
//            localDB.indexedDB.getAllTableElements(table);
//        };
      
        request.onerror = function(e) {
            //console.log("Error Adding: ", e);
        };
    };
      
    localDB.indexedDB.getAllTableElements = function(table, successFunction) {
        
        if(table.customFunction != null) {
            table.customFunction();
        }

        var db = localDB.indexedDB.db;
        
        var trans = db.transaction([table.name], "readwrite");
        var store = trans.objectStore(table.name);

        var keyRange = IDBKeyRange.lowerBound(0);
        var cursorRequest = store.openCursor(keyRange);

        cursorRequest.onsuccess = function(e) {
            var result = e.target.result;
            if(!!result == false)
              return;

            successFunction(result);
          
            result.continue();
        };

      cursorRequest.onerror = localDB.indexedDB.onerror;

    };
      
    function returnTableElements(tuple, table) {
        table.resultFunction(tuple, table);
    }
      
    function initDatabase(dbName, tables, dbVersion) {
        localDB.indexedDB.open(dbName, tables, dbVersion);
    }
}else {
     $(function() {
        loadSplashScreen(null);
     });
}