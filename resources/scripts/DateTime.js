/*
* @Author: Shiv Chawla
* @Date:   2017-04-07 14:34:31
* @Last Modified by:   Shiv Chawla
* @Last Modified time: 2017-08-22 11:20:38
*/

(function(window){
    'use strict';
    function dateLib() {
        var _dateLib = {};
        
        _dateLib.formatDate = function (date) {

            var today = new Date(date);
            today.setDate(today.getDate());
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0!
            var yyyy = today.getFullYear();

            if (dd < 10) {
                dd = '0' + dd
            }

            if (mm < 10) {
                mm = '0' + mm
            }

            today = dd + '/' + mm + '/' + yyyy;
            return today;
        };

        _dateLib.formatDateForTable = function (date) {

            var today = new Date(date);
            today.setDate(today.getDate());
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0!
            var yyyy = today.getFullYear();

            if (dd < 10) {
                dd = '0' + dd
            }

            if (mm < 10) {
                mm = '0' + mm
            }

            today = yyyy+' - '+mm+' - '+dd;
            return today;
        };

        _dateLib.formatDateTime = function (date) {
            date = new Date(date);
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            var mm = date.getMonth() + 1;
            mm = mm > 9 ? mm : '0' + mm.toString();
            var dd = date.getDate();
            dd = dd > 9 ? dd : '0' + dd.toString();
            return dd + "/" + mm + "/" + date.getFullYear() + "  " + strTime;
        };

        _dateLib.formatMoneyValue = function(val) {
            //var numCommas = Math.floor(Math.log10(val)/3);
            //1029732
            //0123456
            //1234567
            var valStr = val.toString();
            valStr = valStr.split("").reverse().join("");
            var str="";
            var k = 0;
            for(var i=0; i<valStr.length; i++) {
                var mod = k > 0 ? 3 + k*2 : 3;
                if((i+1)%mod == 0 && i<valStr.length-1) {
                    str = str.concat(valStr[i]+',');
                    k++;
                } else {
                    str = str.concat(valStr[i]);
                }
            }                    
        
            return str.split("").reverse().join("");
        };

        _dateLib.formatDateLocale = function(date) {
            var options = {
                weekday: "long", year: "numeric", month: "short",
                day: "numeric", hour: "2-digit", minute: "2-digit"
            };

            return new Date(date).toLocaleTimeString("en-us", options);
        };

        return _dateLib;
    }

    if(typeof(window.date) === 'undefined'){
        window.date = dateLib();
    }
})(window);