import {reactLocalStorage} from 'reactjs-localstorage';
import moment from 'moment';
import _ from 'lodash';
import axios from 'axios';
import cookie from 'react-cookies';

const {requestUrl, webSocketUrl, dailyContestDomain, env = '', marketPlaceDomain} = require('./localConfig');

class Utils{
	static userInfoString = `${env}USERINFO`;
	static loggedInUserinfo = cookie.load(`${env}USERINFO`);
	static webSocket;

	static setLoggedInUserInfo(object){
		this.loggedInUserinfo = object;
	}

	static goToDailyContestPage = url => {
		window.location.href = `${dailyContestDomain}/${url}`;
	}

	static goToMarketPlace = url => {
		window.location.href = `${marketPlaceDomain}${url}`;
	}


	static setShouldUpdateToken(status){
		this.cookieStorageSave('SHOULDUPDATETOKEN', status);
	}

	static getShouldUpdateToken(){
		return cookie.load('SHOULDUPDATETOKEN');
	}

	static getSocketUrl(){
		return webSocketUrl;
	}

	static getBaseUrl(){
		return requestUrl;
	}

	static getAnnouncementUrl(){
		return "/assets/community/announcement.json";
	}

	static getPolicyTxtUrl(){
		return "/assets/policy/privacy.txt";
	}

	static getHelpUrl(){
		return "/assets/help/data_help.json";
	}

	static getBenchMarkUrl(){
		return "/assets/benchmark/benchmark.json";
	}

	static getTutorialUrl(){
		return "/assets/help/data_tutorial.json";
	}

	static getTncUrl(){
		return "/assets/policy/tnc.txt";
	}

	static goToLoginPage(history, fromUrl){
		if (fromUrl){
			this.localStorageSave('redirectToUrlFromLogin', fromUrl);
			this.cookieStorageSave('redirectToUrlFromLogin', fromUrl);
		}
		if (history){
			Utils.logoutUser();
			window.location.href = `${dailyContestDomain}/login`;
		}
	}

	static checkErrorForTokenExpiry(error, history, fromUrl){
		if (error && error.response && error.response.data){
			if(error.response.data.name==='TokenExpiredError' ||
				error.response.data.message==='jwt expired'){
					console.log('Token Expired Error ');
				if (this.loggedInUserinfo.recentTokenUpdateTime
					&& (moment().valueOf() < ((60*1000) + this.loggedInUserinfo.recentTokenUpdateTime)) ){
					return;
				}else if(fromUrl && fromUrl.indexOf('/community') !== -1){
					this.logoutUser();
					history.push(fromUrl);
				}else{
					console.log('Token Will be Updated ');
					this.setShouldUpdateToken(true);
					window.location.href = `${dailyContestDomain}/tokenUpdate?redirectUrl=${encodeURIComponent(fromUrl)}&research=true`;
				}
			}
		}
	}

	static getRedirectAfterLoginUrl(){
		const url = this.getFromLocalStorage('redirectToUrlFromLogin');
		this.localStorageSave('redirectToUrlFromLogin', '');
		if (url && url.trim().length > 0){
			return url.trim();
		}else{
			return undefined;
		}
	}

	static logoutUser(){
		if (env === 'localhost') {
			cookie.save(this.userInfoString, {}, {path: '/'});
		} else {
			cookie.save(this.userInfoString, {}, {path: '/', domain: '.adviceqube.com'});
		}
		this.setLoggedInUserInfo({});
	}

	static cookieStorageSave(key, value) {
		if (env === 'localhost') {
			cookie.save(key, value, {path: '/'});
		} else {
			cookie.save(key, value, {path: '/', domain: '.adviceqube.com'});
		}
	}

	static localStorageSave(key, value){
		reactLocalStorage.set(key, value);
	}

	static getFromLocalStorage(key){
		return reactLocalStorage.get(key);
	}

	static localStorageSaveObject(key, value){
		reactLocalStorage.setObject(key, value);
	}

	static getObjectFromLocalStorage(key){
		return reactLocalStorage.getObject(key);
	}	

	static isLoggedIn(){
		this.loggedInUserinfo = cookie.load(this.userInfoString);
		if (this.loggedInUserinfo && this.loggedInUserinfo['token']){
			return true;
		}else{
			return false;
		}
	}

	static getAuthToken(){
		this.loggedInUserinfo = cookie.load(this.userInfoString);
		if (this.loggedInUserinfo && this.loggedInUserinfo['token']){
			return this.loggedInUserinfo['token'];
		}else{
			return "";
		}
	}

	static getAuthTokenHeader(headers){
		let headersLocal = headers;
		if(!headersLocal){
			headersLocal = {};
		}
		if (this.isLoggedIn()){
			headersLocal['aimsquant-token'] = this.getAuthToken();
		}
		return headersLocal;
	}

	static getUserId(){
		this.loggedInUserinfo = cookie.load(this.userInfoString);
		if (this.loggedInUserinfo && this.loggedInUserinfo['_id']){
			return this.loggedInUserinfo['_id'];
		}else{
			return "";
		}
	}

	static getUserInfo(){
		this.loggedInUserinfo = cookie.load(this.userInfoString);
		if (this.loggedInUserinfo){
			return this.loggedInUserinfo;
		}else{
			return {};
		}
	}

	static updateUserToken(newToken){
		this.loggedInUserinfo['token'] = newToken;
		this.loggedInUserinfo['recentTokenUpdateTime'] = moment().valueOf();
		this.localStorageSaveObject(this.userInfoString, this.loggedInUserinfo);
	}

	static getLoggedInUserName(){
		let stringy = "";
		const data = this.getUserInfo();
		if (data){
			stringy = data.firstName + " " + data.lastName;
		}
		return stringy;
	}

	static getLoggedInUserEmail(){
		let stringy = "";
		const data = this.getUserInfo();
		if (data){
			stringy = data.email;
		}
		return stringy;
	}

	static getLoggedInUserInitials(){
		let stringy = "";
		const data = this.getUserInfo();
		if (data){
			stringy = this.getInitials(data.firstName, data.lastName);
		}
		return stringy;
	}

	static getInitials(firstName, lastName){
		let returnString = "";
		if (firstName && firstName.trim().length > 0){
			returnString = returnString + firstName.trim().slice(0, 1).toUpperCase();
		}
		if (lastName && lastName.trim().length > 0){
			returnString = returnString + lastName.trim().slice(0, 1).toUpperCase();
		}
		return returnString;
	}

	static getReactQuillEditorModules(){
		const modules = {
		      toolbar: [
		        [{ 'header': [1, 2, 3, false] }],
		        ['bold', 'italic', 'underline','strike', 'blockquote', 'code-block'],
		        [{'list': 'ordered'}, {'list': 'bullet'}],
		        ['link'],
		        ['clean']
		      ],
		    };
		return modules;
	}

	static formatMoneyValueMaxTwoDecimals(value){
		if (value){
			var x=value.toString();
			var startSymbol = '';
			var afterPoint = '';
			if(x.indexOf('.') > 0)
			   afterPoint = x.substring(x.indexOf('.'),x.length);
			x = Math.floor(x);
			x=x.toString();
			if (x.charAt(0) === '-'){
				x=x.substring(1,x.length);
				startSymbol = '-';
			}
			var lastThree = x.substring(x.length-3);
			var otherNumbers = x.substring(0,x.length-3);
			if (afterPoint.length === 0){
				afterPoint = '.00';
			}else if (afterPoint.length === 1){
				afterPoint = afterPoint + '00';
			}else if (afterPoint.length === 2){
				afterPoint = afterPoint + '0';
			}
			if(otherNumbers !== '')
			    lastThree = ',' + lastThree;
			return startSymbol+otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint.substring(0, 3);
		}else if (value ===0){
			return '0.00';
		}else{
			return value;
		}
	}

	static formatInvestmentValue(value) {
		if (value && typeof(value) == "number"){
			var valueLac = value/100;
			var valueCr = value/10000;
			var roundVal = value - Math.floor(value) > 0; 
			var roundLacs = valueLac - Math.floor(valueLac) > 0;
			var roundCrs = valueCr - Math.floor(valueCr) > 0;

			return valueLac >= 1.0 ?  
				valueCr >= 1.0 ? 
				(roundCrs > 0 ? `${(valueCr).toFixed(2)}Cr` : `${valueCr.toFixed(0)}Cr`) : 
			 	(roundLacs ? `${valueLac.toFixed(2)}L` : `${valueLac.toFixed(0)}L`) : 
				(roundVal ? `${value.toFixed(2)}K` : `${value.toFixed(0)}K`);
		} else{
			return value;
		}
	}

	static formatInvestmentValueNormal(value) {
		if (value && typeof(value) == "number"){
			var valueThousand = value / 1000;
			var valueLac = value / 100000;
			var valueCr = value / 10000000;
			var roundVal = value - Math.floor(value) > 0; 
			var roundThousand = valueThousand - Math.floor(valueThousand) > 0;
			var roundLacs = valueLac - Math.floor(valueLac) > 0;
			var roundCrs = valueCr - Math.floor(valueCr) > 0;

			return valueThousand >= 1.0 
				? 	valueLac >= 1.0 
						? 	valueCr >= 1.0 
								? 	(roundCrs > 0 ? `${(valueCr).toFixed(2)}Cr` : `${valueCr.toFixed(0)}Cr`) 
								: 	(roundLacs ? `${valueLac.toFixed(2)}L` : `${valueLac.toFixed(0)}L`) 
						: 	(roundThousand > 0 ? `${valueThousand.toFixed(2)}K` : `${valueThousand.toFixed(0)}K`)
				: 	(roundVal ? `${value.toFixed(2)}K` : `${value.toFixed(0)}`);
		} else{
			return value;
		}
	}

	static getNumberFromFormattedMoney(moneyString){
		if (moneyString){
			return Number(moneyString.replace(/,/g , "").trim());
		}
		return 0;
	}

	static openSocketConnection(){
		if (this.webSocket){
			try{
				this.webSocket.close();
			}catch(err){}
		}
		this.webSocket = new WebSocket(this.getSocketUrl());
	}

	static closeWebSocket(){
		try{
			this.webSocket.close();
		}catch(err){}
		this.webSocket = undefined;
	}

	static firstLetterUppercase(stringy){
		if (stringy && stringy.length > 0){
			return stringy[0].toUpperCase() + stringy.substring(1);
		}else{
			return '';
		}
	}

	static getStringWithNoSpaces(stringy){
		if (stringy){
			return stringy.replace(/\s+/g, "");
		}else{
			return "";
		}
	}

	static getLowerCasedNoSpaces(stringy){
		if (stringy){
			return this.getStringWithNoSpaces(stringy).toLowerCase();
		}else{	
			return "";
		}
	}




	static saveCommunitySearchString(stringy){
		let savedData = this.getObjectFromLocalStorage('COMMUNITYFILTERS');
		if (!savedData){
			savedData = {};
		}
		savedData['searchString'] = stringy;
		this.localStorageSaveObject('COMMUNITYFILTERS', savedData);
	}

	static saveCommunityTab(stringy){
		let savedData = this.getObjectFromLocalStorage('COMMUNITYFILTERS');
		if (!savedData){
			savedData = {};
		}
		savedData['tabs'] = stringy;
		this.localStorageSaveObject('COMMUNITYFILTERS', savedData);
	}

	static saveCommunityCheckBox(stringy){
		let savedData = this.getObjectFromLocalStorage('COMMUNITYFILTERS');
		if (!savedData){
			savedData = {};
		}
		savedData['checkboxes'] = stringy;
		this.localStorageSaveObject('COMMUNITYFILTERS', savedData);
	}

	static getCommunitySearchString(){
		let savedData = this.getObjectFromLocalStorage('COMMUNITYFILTERS');
		if (savedData && savedData.searchString){
			return savedData.searchString;
		}
		return '';
	}
	static getCommunityTab(){
		let savedData = this.getObjectFromLocalStorage('COMMUNITYFILTERS');
		if (savedData && savedData.tabs){
			return savedData.tabs;
		}
		return '';
	}
	static getCommunityCheckBox(){
		let savedData = this.getObjectFromLocalStorage('COMMUNITYFILTERS');
		if (savedData && savedData.checkboxes){
			return savedData.checkboxes;
		}
		return '';
	}

	static checkForInternet (error, history) {
		if (error.message === 'Network Error') {
			history.push('/errorPage');
		}
	}

	static checkForServerError(error, history, fromUrl) {
		return new Promise((resolve, reject) => {
			const errorCode = _.get(error, 'response.data.code', '');
			const statusCode = _.get(error, 'response.data.statusCode', 0);
			if (errorCode === 'server_error' && statusCode === 403) {
				// Utils.goToLoginPage(history, fromUrl);
				console.log('Error Code ', errorCode);
				console.log('Server Error Happened');
				history.push('/server_error');
				reject(false);
			} else {
				console.log('No status error');
				resolve(true);
			}
		})
	}

	static autoLogin(token, history, redirectUrl, callback) {
		const headers = {
			'aimsquant-token': token
		};
		axios.get(`${requestUrl}/me`, {headers})
        .then(response => {
            Utils.localStorageSaveObject(Utils.userInfoString, {...response.data, token});
			Utils.setLoggedInUserInfo({...response.data, token});
			callback();
        })
        .catch(error => {
          this.checkForInternet(error, history);
          if (error.response) {
              if (error.response.status === 400 || error.response.status === 403) {
                  history.push('/forbiddenAccess');
              }
              this.checkErrorForTokenExpiry(error, history, redirectUrl);
          }
          return error;
        });
	}

	static checkToken(token) {
		return token && token !== undefined && token!== null && token.length > 0;
	}

	static getTime(date) {
		return (new Date(date)).getTime();
	}

	static goToErrorPage(error, history) {
		if (error.response.status === 400) {
			history.push('/badRequest');
		} else if (error.response.status === 403) {
			history.push('/forbiddenAccess');
		} else {
			history.push('/errorPage');
		}
	}
}

export default Utils;
