function initUserSettings() {
    
    var tables = new Array();
    tables[0] = settings;
    tables[1] = timeTable;
    tables[2] = workSheet;
    tables[3] = textSnippet;
    tables[4] = crossword;

    $("#intro").click(function () {
        $(this).toggleClass("activeEntry");

        if (!digUPSettings.enableIndexedDB) {
            $.cookie('show_intro', $(this).hasClass("activeEntry"), { expires: 365 });
        } else {
            var data = {
                "primaryKey": "showIntro_2",
                "name": "ShowIntro",
                "bool": true,
                "description": "Switch to false to show the dfvsdo on statrup."
            };

            var successFunction = function(result) {
                if (result && !result.bool) {
                    data.bool = true;
                    localDB.indexedDB.addElement(data, settings);
                } else {
                    data.bool = false;
                    if (!result) {
                        localDB.indexedDB.addElement(data, settings);
                    } else {
                        if (result.bool) {
                            localDB.indexedDB.addElement(data, settings);
                        }
                    }
                }
            };

            localDB.indexedDB.getTableElementByTag(settings, "ShowIntro", "name", successFunction);
        }
    });

    if (digUPSettings.enableIndexedDB) {
        initDatabase("DigUp_Menschen_A1", tables, 1);
    }
        
}

function checkUpUserSettings(table) {
    var setCheckBoxOption = function (result) {
        //         if (!result || result.bool) {
        //            $("#intro").prop("checked", false);
        //        }else {
        //$("#intro").prop("checked", true);
        //Load startup page if app is initially started
        loadSplashScreen(result);
        //if (currentPage == undefined || currentPage == null || parseInt(currentPage.Number) == 0) {
        //    $("#content, #navigation").show();
        //    loadInitPage(9);
        //}
        //}
    };
    //localDB.indexedDB.getAllTableElements(table);

    //loads settings
    localDB.indexedDB.getTableElementByTag(table, "ShowIntro", "name", setCheckBoxOption);
}
