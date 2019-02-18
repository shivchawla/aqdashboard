import React, { Component } from 'react';
import _ from 'lodash';
import Utils from './../../Utils';
import { Spin, Icon, Row, Col, Tabs, Radio, Button, Modal } from 'antd';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import Moment from 'react-moment';
import AceEditor from 'react-ace';
import ReactTable from 'react-table';
import moment from 'moment';
import LiveTestPerformanceChart from './../../CustomHighCharts/LiveTestPerformanceChart.jsx';

import Loading from 'react-loading-bar'
import 'react-loading-bar/dist/index.css'

class ForwardtestDetail extends Component {

  _mounted = false;
  queryParams = undefined;
  cancelGetForwardtest = undefined;
  cancelRestartApicall = undefined;
  cancelStopApicall = undefined;
  cancelDeleteApicall = undefined;
  portfolioColumns = [
    {
      Header: 'Date',
      accessor: 'date',
      sortMethod: (a, b, desc) => {
         return 0;
      },
      filterMethod: (filter, row) =>
                    row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) > -1
    },
    {
      Header: 'Position Count',
      accessor: 'noOfPositions',
      sortMethod: (a, b, desc) => {
         return a - b;
      }
    },
    {
      Header: 'Total Market Value',
      accessor: 'totalMarketValue',
      sortMethod: (a, b, desc) => {
         return Utils.getNumberFromFormattedMoney(a) - Utils.getNumberFromFormattedMoney(b);
      },
      filterMethod: (filter, row) =>
                    String(Utils.getNumberFromFormattedMoney(row[filter.id])).startsWith(filter.value)
    },
    {
      Header: 'Total Unrealized PnL',
      accessor: 'totalUnrealisedPnL',
      sortMethod: (a, b, desc) => {
         return Utils.getNumberFromFormattedMoney(a) - Utils.getNumberFromFormattedMoney(b);
      },
      filterMethod: (filter, row) =>
                    String(Utils.getNumberFromFormattedMoney(row[filter.id])).startsWith(filter.value)
    }
  ];

  subPortfolioColumns = [
    {
      Header: 'Date',
      accessor: 'date',
      sortMethod: (a, b, desc) => {
         return 0;
      }
    },
    {
      Header: 'Symbol',
      accessor: 'symbol'
    },
    {
      Header: 'Average Price',
      accessor: 'avgPrice',
      sortMethod: (a, b, desc) => {
         return Utils.getNumberFromFormattedMoney(a) - Utils.getNumberFromFormattedMoney(b);
      }
    },
    {
      Header: 'Quantity',
      accessor: 'quantity',
      sortMethod: (a, b, desc) => {
         return a - b;
      }
    },
    {
      Header: 'Last Price',
      accessor: 'lastPrice',
      sortMethod: (a, b, desc) => {
         return Utils.getNumberFromFormattedMoney(a) - Utils.getNumberFromFormattedMoney(b);
      }
    },
    {
      Header: 'Market Value',
      accessor: 'marketValue',
      sortMethod: (a, b, desc) => {
         return Utils.getNumberFromFormattedMoney(a) - Utils.getNumberFromFormattedMoney(b);
      }
    },
    {
      Header: 'Unrealized PnL',
      accessor: 'unrealizedPnL',
      sortMethod: (a, b, desc) => {
         return Utils.getNumberFromFormattedMoney(a) - Utils.getNumberFromFormattedMoney(b);
      }
    }
  ];
  
  transactionColumns = [
    {
      Header: 'Date',
      accessor: 'date',
      sortMethod: (a, b, desc) => {
         return 0; //as they are already sorted no need for this, but if they are not sorted then 
         //you have to do moment(a).isBefore(moment(b)) etc checks
      },
      filterMethod: (filter, row) =>
                    row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) > -1
    },
    {
      Header: 'Num. Buy Trades',
      accessor: 'posTrades',
      sortMethod: (a, b, desc) => {
         return a - b;
      }
    },
    {
      Header: 'Num. Sell Trades',
      accessor: 'negTrades',
      sortMethod: (a, b, desc) => {
         return a - b;
      }
    },
    {
      Header: 'Total Buy Value',
      accessor: 'posDollarValue',
      sortMethod: (a, b, desc) => {
         return Utils.getNumberFromFormattedMoney(a) - Utils.getNumberFromFormattedMoney(b);
      },
      filterMethod: (filter, row) =>
                    String(Utils.getNumberFromFormattedMoney(row[filter.id])).startsWith(filter.value)
    },
    {
      Header: 'Total Sell Value',
      accessor: 'negDollarValue',
      sortMethod: (a, b, desc) => {
         return Utils.getNumberFromFormattedMoney(a) - Utils.getNumberFromFormattedMoney(b);
      },
      filterMethod: (filter, row) =>
                    String(Utils.getNumberFromFormattedMoney(row[filter.id])).startsWith(filter.value)
    }
  ];
  subTransactionColumns = [
    {
      Header: 'Date',
      accessor: 'date',
      sortMethod: (a, b, desc) => {
         return 0;
      }
    },
    {
      Header: 'Symbol',
      accessor: 'symbol'
    },
    {
      Header: 'Direction',
      accessor: 'direction'
    },
    {
      Header: 'Quantity',
      accessor: 'quantity',
      sortMethod: (a, b, desc) => {
         return a - b;
      }
    },
    {
      Header: 'Price',
      accessor: 'price',
      sortMethod: (a, b, desc) => {
         return Utils.getNumberFromFormattedMoney(a) - Utils.getNumberFromFormattedMoney(b);
      }
    },
    {
      Header: 'Order Fee',
      accessor: 'orderfee',
      sortMethod: (a, b, desc) => {
         return Utils.getNumberFromFormattedMoney(a) - Utils.getNumberFromFormattedMoney(b);
      }
    }
  ];
  proposedOrdersColumns = [
    {
      Header: 'Date',
      accessor: 'date',
      sortMethod: (a, b, desc) => {
         return 0; //as they are already sorted no need for this, but if they are not sorted then 
         //you have to do moment(a).isBefore(moment(b)) etc checks
      }
    },
    {
      Header: '+ve Trades (#)',
      accessor: 'posTrades',
      sortMethod: (a, b, desc) => {
         return a - b;
      }
    },
    {
      Header: '-ve Trades (#)',
      accessor: 'negTrades',
      sortMethod: (a, b, desc) => {
         return a - b;
      }
    },
    {
      Header: '# Quantity (+ve Trades)',
      accessor: 'posQuantity',
      sortMethod: (a, b, desc) => {
         return a - b;
      }
    },
    {
      Header: '# Quantity (-ve Trades)',
      accessor: 'negQuantity',
      sortMethod: (a, b, desc) => {
         return a - b;
      }
    }
  ];
  subProposedOrdersColumns = [
    {
      Header: 'Date',
      accessor: 'date'
    },
    {
      Header: 'Symbol',
      accessor: 'symbol'
    },
    {
      Header: 'Direction',
      accessor: 'direction'
    },
    {
      Header: 'Quantity',
      accessor: 'quantity'
    }
  ];

  constructor(props){
  	super();
  	this.state = {
      'loading': true,
      'forwardTestData': {},
      'portfolioMode': 'LatestPortfolio',
      'transactionMode': 'ProposedOrders',
      'buttonLoading': false
  	};
    if(props.location.search){
      this.queryParams = new URLSearchParams(props.location.search);
    } 
    this.updateState = (data) => {
      if (this._mounted){
        this.setState(data);
      }
    }

    this.getForwardTest = () =>{
      axios(Utils.getBaseUrl() + '/forwardtest/' + _.get(props, 'match.params.forwardtestId', null), {
        cancelToken: new axios.CancelToken( (c) => {
          // An executor function receives a cancel function as a parameter
          this.cancelGetForwardtest = c;
        }),
        'headers': Utils.getAuthTokenHeader()
      })
        .then((response) => {
            const portfolioData = this.computePortfolioTableData(response.data);
            this.updateState({
              'forwardTestData': response.data, 
              'loading': false,
              'portfolioHistory': portfolioData,
              'transactionHistory':{
                ...this.computeProposedOrders(response.data),
                ...this.computeTransactions(response.data)
              },
              'settings': this.computeSettings(response.data),
              'logs': this.computeLogs(response.data),
              'performanceChartData': this.createCumRetLineChart(response.data)
            });
            this.cancelGetForwardtest = undefined;
          })
          .catch((error) => {
            Utils.checkForInternet(error, this.props.history);
            if (error.response) {
              Utils.goToErrorPage(error, this.props.history);
              Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
            this.updateState({
              'loading': false
            });
            this.cancelGetForwardtest = undefined;
          });
    }
    this.handleModeChange = (event) => {
      this.updateState({'portfolioMode': event.target.value});
    }
    this.handleTransactionModeChange = (event) => {
      this.updateState({'transactionMode': event.target.value});
    }

    this.restartTheTest = () => {
      this.updateState({'buttonLoading': true});
      axios({
              method: 'PUT',
              url: Utils.getBaseUrl() + '/forwardtest/' + _.get(props, 'match.params.forwardtestId', null) +'?active=true',
              'headers': Utils.getAuthTokenHeader()
            }, {
            cancelToken: new axios.CancelToken( (c) => {
              this.cancelRestartApicall = c;
            })
          })
          .then((response) => {
              this.cancelRestartApicall = undefined;
              let forwardTest = JSON.parse(JSON.stringify(this.state.forwardTestData));
              forwardTest.active = true;
              this.updateState({
                'buttonLoading': false,
                'forwardTestData': forwardTest
              });
          })
          .catch((error) => {
            Utils.checkForInternet(error, this.props.history);
            if (error.response) {
              Utils.goToErrorPage(error, this.props.history);
              Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
            this.cancelRestartApicall = undefined;
            this.updateState({
              'buttonLoading': false
            });
          });
    }

    this.stopForwardTest = () => {
      this.updateState({'buttonLoading': true});
      axios({
              method: 'PUT',
              url: Utils.getBaseUrl() + '/forwardtest/' + _.get(props, 'match.params.forwardtestId', '') + '?active=false',
            'headers': Utils.getAuthTokenHeader()
            }, {
            cancelToken: new axios.CancelToken( (c) => {
              this.cancelStopApicall = c;
            })
          })
          .then((response) => {
              this.cancelStopApicall = undefined;
              let forwardTest = JSON.parse(JSON.stringify(this.state.forwardTestData));
              forwardTest.active = false;
              this.updateState({
                'buttonLoading': false,
                'forwardTestData': forwardTest
              });
          })
          .catch((error) => {
            Utils.checkForInternet(error, this.props.history);
            if (error.response) {
              Utils.goToErrorPage(error, this.props.history);
              Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
            this.cancelStopApicall = undefined;
            this.updateState({
              'buttonLoading': false
            });
          });
    }

    this.deleteForwardTest = () => {
      this.updateState({'buttonLoading': true});
      axios({
              method: 'DELETE',
              url: Utils.getBaseUrl() + '/forwardtest/' + _.get(props, 'match.params.forwardtestId', null),
             'headers': Utils.getAuthTokenHeader()
            }, {
            cancelToken: new axios.CancelToken( (c) => {
              this.cancelDeleteApicall = c;
            })
          })
          .then((response) => {
              this.cancelDeleteApicall = undefined;
              this.props.history.push('/research');
          })
          .catch((error) => {
            Utils.checkForInternet(error, this.props.history);
            if (error.response) {
              Utils.goToErrorPage(error, this.props.history);
              Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
            this.cancelDeleteApicall = undefined;
            this.updateState({
              'buttonLoading': false
            });
          });
    }

    this.showConfirm = (title) => {
      Modal.confirm({
        title: title,
        content: '',
        onOk: () => {
          this.restartTheTest();
        },
        onCancel: () => {
        },
      });
    }

    this.showDeleteConfirm = (title) => {
      Modal.confirm({
        title: title,
        content: '',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: () => {
          if (this.state.forwardTestData.active){
            this.stopForwardTest();
          }else{
            this.deleteForwardTest();
          }
        },
        onCancel: () => {
        },
      });
    }
  }



    computePortfolioTableData(forwardTestData) {
        let hasValidData = forwardTestData ? forwardTestData.serializedData ? true : false : false;

        if(hasValidData) {
            let accounttracker = _.get(forwardTestData, 'serializedData.accounttracker', {});
            
            let positionsArray = [];
            
            if(accounttracker) {
                Object.keys(accounttracker).sort().forEach(key => {
                    let account = accounttracker[key];

                    let tempArray = [];
                    if(account.portfolio.positions) {
                    //array of array
                        Object.keys(account.portfolio.positions).forEach(pkey => {
                            let position = _.get(account, `portfolio.positions[${pkey}]`, {});
                            
                            if(Math.abs(position.quantity) > 0) {
                                position.date = key;
                                tempArray.push(position);    
                            }
                        });

                        tempArray.sort(
                            function(a,b){
                                return a.symbol < b.symbol ? 1 : -1;
                            });
                    }

                  positionsArray = positionsArray.concat(tempArray);
                    
                });
            }
            positionsArray.reverse();
            let portfolioHistory = {};
            let portfolioParentData = {};
            for(let i=0; i<positionsArray.length; i++){
              const dtL3 = positionsArray[i];
              const dtPush = {
                  'datetime': moment(dtL3.date, 'YYYY-MM-DD').valueOf(),
                  'date':'-',
                  'symbol':dtL3.securitysymbol.ticker,
                  'avgPrice':dtL3.averageprice,
                  'quantity': dtL3.quantity,
                  'lastPrice':dtL3.lastprice,
                  'marketValue':Utils.formatMoneyValueMaxTwoDecimals((dtL3.quantity * dtL3.lastprice)),
                  'unrealizedPnL':Utils.formatMoneyValueMaxTwoDecimals((dtL3.quantity * (dtL3.lastprice - dtL3.averageprice))),
                  'key': i+'_'+dtL3.securitysymbol.ticker
                }
              try{
                dtPush['date'] = moment(dtL3.date, 'YYYY-MM-DD').format("DD MMM YYYY");
              }catch(err){

              }
              if (!portfolioHistory[dtPush.date]){
                portfolioHistory[dtPush.date] = [dtPush];
              }else{
                portfolioHistory[dtPush.date].push(dtPush);
              }
              let dataObj = {
                
              };
              if (portfolioParentData[dtPush.date]){
                dataObj = portfolioParentData[dtPush.date];
              }else{
                dataObj = {
                  'datetime': dtPush['datetime'],
                  'date': dtPush['date'],
                  'noOfPositions': 0,
                  'totalMarketValue': 0,
                  'totalUnrealisedPnL': 0
                }
              }
              dataObj.noOfPositions = dataObj.noOfPositions + 1;
              dataObj.totalMarketValue = dataObj.totalMarketValue + (dtL3.quantity * dtL3.lastprice);
              dataObj.totalUnrealisedPnL = dataObj.totalUnrealisedPnL + (dtL3.quantity * (dtL3.lastprice - dtL3.averageprice));
              portfolioParentData[dtPush.date] = dataObj;
            }
            let latestPortfolioValues = [];
            const finalPortfolioParentData = [];
            for(let key in portfolioParentData){
              const abcLocal = portfolioParentData[key];
              abcLocal['totalMarketValue'] = Utils.formatMoneyValueMaxTwoDecimals(abcLocal['totalMarketValue']);
              abcLocal['totalUnrealisedPnL'] = Utils.formatMoneyValueMaxTwoDecimals(abcLocal['totalUnrealisedPnL']);
              finalPortfolioParentData.push(abcLocal);
            }
            finalPortfolioParentData.sort((a,b) => {
              return a.datetime - b.datetime;
            });
            if (finalPortfolioParentData.length > 0){
              latestPortfolioValues.push(finalPortfolioParentData[0]);
            }
            return {
              'latestPortfolio': latestPortfolioValues,
              'portfolioHistory': portfolioHistory,
              'portfolioHistorySummary': finalPortfolioParentData
            };
        }else{
          return {
              'latestPortfolio': [],
              'portfolioHistory': {},
              'portfolioHistorySummary': []
            };
        }
    }

    computeProposedOrders(forwardTestData) {
        let hasValidData = forwardTestData ? forwardTestData.serializedData ? true : false : false;

        if(hasValidData) {
            let blotter = _.get(forwardTestData, 'serializedData.brokerage.blotter', null);
            
            let ordersArray = [];
            if(blotter) {
                Object.keys(blotter).sort().forEach(key => {
                    
                    //array of array
                    let ordersPerSecurity = blotter[key];
                    ordersArray = ordersArray.concat(ordersPerSecurity);
                });
                
            } 

            ordersArray.sort(
                    function(a,b) {
                        return a.securitysymbol.ticker < b.securitysymbol.ticker ? 1 : -1;
                    });
            let proposedOrdersData = {};
            let proposedOrdersSummary = {};
            for(let i=0; i<ordersArray.length; i++){
              let finalPushObj = {
                'datetime': moment(ordersArray[i].datetime).valueOf(),
                'date': '-',
                'symbol': '-',
                'direction':'BUY',
                'quantity': parseInt(ordersArray[i].fillquantity, 10)
              };
              try{
                if(parseInt(ordersArray[i].fillquantity, 10) < 0){
                  finalPushObj['direction'] = 'SELL';
                }
              }catch(err){}
              try{
                if(ordersArray[i].securitysymbol){
                  finalPushObj['symbol'] = ordersArray[i].securitysymbol.ticker;
                }
              }catch(err){}
              try{
                if(ordersArray[i].datetime){
                  finalPushObj['date'] = moment(ordersArray[i].datetime).format('DD MMM YYYY');
                }
              }catch(err){}

              if (!proposedOrdersData[finalPushObj.date]){
                proposedOrdersData[finalPushObj.date] = [finalPushObj];
              }else{
                proposedOrdersData[finalPushObj.date].push(finalPushObj);
              }
              let dataObj = {};
              if (proposedOrdersSummary[finalPushObj.date]){
                dataObj = proposedOrdersSummary[finalPushObj.date];
              }else{
                dataObj={
                  'datetime': finalPushObj.datetime,
                  'date': finalPushObj.date,
                  'posTrades': 0,
                  'negTrades': 0,
                  'posQuantity': 0,
                  'negQuantity': 0
                }
              }
              if (finalPushObj.direction === 'SELL'){
                dataObj.negTrades = dataObj.negTrades + 1;
                dataObj.negQuantity = dataObj.negQuantity + finalPushObj.quantity;
              }else{
                dataObj.posTrades = dataObj.posTrades + 1;
                dataObj.posQuantity = dataObj.posQuantity + finalPushObj.quantity;
              }
              proposedOrdersSummary[finalPushObj.date] = dataObj;
            }
            const finalProposedOrderSummary = [];
            for(let key in proposedOrdersData){
              finalProposedOrderSummary.push(proposedOrdersData[key]);
            }
            finalProposedOrderSummary.sort((a,b) => {
              return a.datetime - b.datetime;
            });
            return {
              'proposedOrdersSummary': finalProposedOrderSummary,
              'proposedOrdersData': proposedOrdersData
            };
        }else{
          return [];
        }
    }


    computeTransactions(forwardTestData) {
        let hasValidData = forwardTestData ? forwardTestData.serializedData ? true : false : false;

        if(hasValidData) {
            let allTransactions = _.get(forwardTestData, 'serializedData.transactiontracker', {});

            let transactionArray = [];
            
            if(allTransactions) {
                
                Object.keys(allTransactions).sort().forEach(key => {
                    //array of array
                    let transactionsPerDay = allTransactions[key].sort(function(a,b){
                            return _.get(a, 'securitysymbol.ticker', 0) < _.get(b, 'securitysymbol.ticker', 0) ? 1 : -1;
                        });

                    transactionArray = transactionArray.concat(transactionsPerDay);
                    
                });
            }

            transactionArray.reverse();
            let transactions = {};
            let transactionSummary = {};
            for(let i=0; i<transactionArray.length; i++){
              let finalPushObj = {
                'datetime': moment(transactionArray[i].datetime).valueOf(),
                'date': '-',
                'symbol': '-',
                'direction':'BUY',
                'quantity': _.get(transactionArray, `[${i}].fillquantity`, 0),
                'price': _.get(transactionArray, `[${i}].fillprice`, 0),
                'orderfee': _.get(transactionArray, `[${i}].orderfee`, 0),
                'key': i+'_transaction_history'
              };
              try{
                if(parseInt(transactionArray[i].fillquantity, 10) < 0){
                  finalPushObj['direction'] = 'SELL';
                }
              }catch(err){}
              try{
                if(transactionArray[i].securitysymbol){
                  finalPushObj['symbol'] = _.get(transactionArray, `[${i}].securitysymbol.ticker`, null);
                }
              }catch(err){}
              try{
                if(transactionArray[i].datetime){
                  finalPushObj['date'] = moment(_.get(transactionArray, `[${i}].datetime`, null)).format('DD MMM YYYY');
                }
              }catch(err){}

              if (!transactions[finalPushObj.date]){
                transactions[finalPushObj.date] = [finalPushObj];
              }else{
                transactions[finalPushObj.date].push(finalPushObj);
              }
              let dataObj = {
                            
                };
                if (transactionSummary[finalPushObj.date]){
                  dataObj = transactionSummary[finalPushObj.date];
                }else{
                  dataObj = {
                    'datetime': finalPushObj['datetime'],
                    'date': finalPushObj['date'],
                    'posTrades': 0,
                    'negTrades': 0,
                    'posDollarValue': 0,
                    'negDollarValue': 0
                  }
                }
                if (finalPushObj.quantity < 0){
                  dataObj.negTrades = dataObj.negTrades + 1;
                  dataObj.negDollarValue = dataObj.negDollarValue + (Number(finalPushObj['quantity'])*Number(finalPushObj.price));
                }else{
                  dataObj.posDollarValue = dataObj.posDollarValue + (Number(finalPushObj['quantity'])*Number(finalPushObj.price));
                  dataObj.posTrades = dataObj.posTrades + 1;
                }
                transactionSummary[finalPushObj.date] = dataObj;
            }
            const finalTransactionParentData = [];
            for(let key in transactionSummary){
              const abcLocal = transactionSummary[key];
              abcLocal['negDollarValue'] = Utils.formatMoneyValueMaxTwoDecimals(abcLocal['negDollarValue']);
              abcLocal['posDollarValue'] = Utils.formatMoneyValueMaxTwoDecimals(abcLocal['posDollarValue']);
              finalTransactionParentData.push(abcLocal);
            }
            finalTransactionParentData.sort((a,b) => {
              return a.datetime - b.datetime;
            });
            return {
            'transactions': transactions,
            'transactionsSummary': finalTransactionParentData
          };
        }else {
          return {
            'transactions': {},
            'transactionsSummary': []
          };
        }
    }


    computeSettings(forwardTestData) {
        let basicSettings = [];
        let brokerageSettings = [];
        let otherSettings = [];
        let settings = [];

        if(forwardTestData.serializedData) {
            let hasValidData = forwardTestData ? forwardTestData.serializedData ? forwardTestData.serializedData.accounttracker ? true : false : false : false;

            if (hasValidData) {
                let accounttracker = _.get(forwardTestData, 'serializedData.accounttracker', {});
                let dates = Object.keys(accounttracker).sort();

                if(dates.length > 0){
                    basicSettings.push({label: "Initial Cash", value: _.get(accounttracker, `[dates[0]].seedcash`, 0), value2: ""});
                } 
            }

            hasValidData = forwardTestData ? forwardTestData.serializedData ? forwardTestData.serializedData.brokerage ? true : false : false : false;
            
            if(hasValidData) {
                let brokerage = _.get(forwardTestData, 'serializedData.brokerage', {});

                if(brokerage.slippage) {
                    ///THE VALUE NEEDS TO BE FIXED (100 is not required everytime)
                    brokerageSettings.push({label:"Slippage", value:_.get(brokerage, 'slippage.value', 0) * 100, value2: _.get(brokerage, 'slippage.model', '')});
                }

                if(brokerage.commission) {
                    ///THE VALUE NEEDS TO BE FIXED
                    brokerageSettings.push({label:"Commission", value:_.get(brokerage, 'commission.value', 0)*100, value2: _.get(brokerage, 'commission.model', '')});
                }

                if(brokerage.cancelpolicy) {
                    brokerageSettings.push({label:"Cancel Policy", value2: _.get(brokerage, 'cancelpolicy', ''), value:""});
                }

                if(brokerage.executionpolicy) {
                    brokerageSettings.push({label:"Execution Policy", value2: _.get(brokerage, 'executionpolicy', ''), value:""});
                }
            }

            hasValidData = forwardTestData ? forwardTestData.serializedData ? forwardTestData.serializedData.tradeenv ? true : false : false : false;
            
            if(hasValidData) {
                let tradeenv = forwardTestData.serializedData.tradeenv;

                otherSettings.push({label: "Rebalance", value2: tradeenv.rebalance.slice(10), value:""});

                otherSettings.push({label: "Resolution", value2: tradeenv.resolution.slice(11), value:""});

                otherSettings.push({label: "Investment Plan", value2: tradeenv.investmentplan.slice(3), value:""});
            }
           
            
        } else {
            let allSettings = forwardTestData.settings;
            let advancedSettings = JSON.parse(forwardTestData.settings.advanced);

            basicSettings.push({label:"Initial Cash", value:allSettings["initialCash"]});

            if(advancedSettings.slippage) {
                brokerageSettings.push({label:"Slippage", value:advancedSettings.slippage.value, value2:advancedSettings.slippage.model});
            }

            if(advancedSettings.commission) {
                brokerageSettings.push({label:"Commission", value:advancedSettings.commission.value, value2:advancedSettings.commission.model});
            }

            if(advancedSettings.cancelPolicy) {
                brokerageSettings.push({label:"Cancel Policy", value2:advancedSettings.cancelPolicy, value:""});
            }

            if(advancedSettings.executionPolicy) {
                brokerageSettings.push({label:"Execution Policy",value2:advancedSettings.executionPolicy, value:""});
            }

            if(advancedSettings.rebalance) {
                otherSettings.push({label: "Rebalance", value2: advancedSettings.rebalance, value:""});
            }

            if(advancedSettings.resolution) {
                otherSettings.push({label: "Resolution", value2: advancedSettings.resolution, value:""});
            }

            if(advancedSettings.investmentPlan) {
                otherSettings.push({label: "Investment Plan", value2: advancedSettings.investmentPlan, value:""});
            }
        }

        settings = settings.concat(basicSettings).concat(brokerageSettings).concat(otherSettings);
          
        return settings;         
    }

    computeLogs(forwardTestData) {
        let hasValidData = forwardTestData ? forwardTestData.serializedData ? forwardTestData.serializedData.logtracker ? true : false : false : false;

        if(hasValidData) {
            let logtracker = forwardTestData.serializedData.logtracker;

            let logs = [];
            
            if(logtracker) {
                Object.keys(logtracker).sort().forEach(date => {
                    let logsDict = logtracker[date];
                    if(date !== "0001-01-01") {
                        Object.keys(logsDict).sort().forEach(entryTime => {
                            let logArray = logsDict[entryTime];

                            for (let i=0;i<logArray.length;i++) {
                                logs = logs.concat(JSON.parse(logArray[i]));
                            }
                        });
                    }
                });
            }
            
            return logs;
        }else {
          return [];
        }
    }

  createCumRetLineChart(forwardTestData) {
      let hasValidData = forwardTestData ? (forwardTestData.serializedData ? true: false) : false;

      if(hasValidData) {

          let algorithmPerformance = {};
          Object.keys(forwardTestData.serializedData.accounttracker).forEach(date => {
              algorithmPerformance[date] = forwardTestData.serializedData.accounttracker[date].netvalue;
          });

          let benchmarkPerformance = {};
          Object.keys(forwardTestData.serializedData.benchmarktracker).forEach(date => {
              benchmarkPerformance[date] = forwardTestData.serializedData.benchmarktracker[date].portfoliostats.netvalue;
          });

          return {
              "algorithm": algorithmPerformance,
              "benchmark": benchmarkPerformance
          };
      }else{
        return {
        }
      }
  }

  componentDidMount(){
    this._mounted = true;
    if (!Utils.isLoggedIn()){
      Utils.goToLoginPage(this.props.history, window.location.href);
    }else{
      if (this.props.pageChange){
        this.props.pageChange('research');
      }
      if (this._mounted){
        this.getForwardTest();
      }
    }
  }

  componentWillUnmount() {
    this._mounted = false;
    if (this.cancelGetForwardtest){
      this.cancelGetForwardtest();
    }
    if (this.cancelRestartApicall){
      this.cancelRestartApicall();
    }
    if(this.cancelStopApicall){
      this.cancelStopApicall();
    }
    if(this.cancelDeleteApicall){
      this.cancelDeleteApicall();
    }
  }

  render() {

    const antIconLoading = <Icon type="loading" style={{ fontSize: 34 }} spin />;
    const TabPane = Tabs.TabPane;

    const getStatusButtons = () =>{
      if (!this.state.loading && !this.state.buttonLoading){
        const buttons = [];
        if(this.state.forwardTestData.active){
          buttons.push(
            <Button type="danger" 
              key={'stopButton'}
              ghost 
              onClick={() => this.showDeleteConfirm('Are you sure you want to stop the test?')}>
                STOP TEST
            </Button>
          );
        }else if(!this.state.forwardTestData.error){
          buttons.push(
            <Button type="primary" 
              key={'restartButton'}
              style={{'marginRight': '10px'}} 
              onClick={() => this.showConfirm('Are you sure you want to restart the test?')}>
                RESTART TEST
            </Button>
          );
          buttons.push(
            <Button type="danger" 
              key={'deleteButton'}
              ghost 
              onClick={() => this.showDeleteConfirm('Are you sure you want to delete the test?')}>
                DELETE TEST
            </Button>
          );
        }
        return buttons;
      }else if(!this.state.loading && this.state.buttonLoading){
        return(
          <div style={{'display': 'flex',
            'alignItems': 'center', 'justifyContent': 'center',
            'minWidth': '100px'}}>
            <Spin indicator={antIconLoading} />
          </div>
        );
      }
    }

    const addMetricData = (currentState) => {
       const metrics = [
            {
                "metricName": "Portfolio Value",
                "metricValue": currentState && currentState.account ? Utils.formatMoneyValueMaxTwoDecimals(currentState.account.netvalue.toFixed(0)) : "-", 
                "metricDescription": "Net Asset Value",
            },
            {
                "metricName": "Cash",
                "metricValue": currentState && currentState.account ? Utils.formatMoneyValueMaxTwoDecimals(currentState.account.portfolio.cash.toFixed(0)) : "-", 
                "metricDescription": "Volatility"
            },
            {
                "metricName": "Leverage",
                "metricValue": currentState && currentState.account ? currentState.account.leverage.toFixed(2).toString() : "-", 
                "metricDescription": "Leverage"
            },
            {
                "metricName": "Total Return",
                "metricValue": currentState && currentState.performance ? ((currentState.performance.returns.totalreturn - 1)*100).toFixed(2).toString() + '%' : "-",
                "metricDescription": "Total Return"
            },
            {
                "metricName": "Volatility",
                "metricValue": currentState && currentState.performance ? (currentState.performance.deviation.annualstandarddeviation * 100).toFixed(2).toString() + '%' : "-",
                "metricDescription": "Volatility"
            },
            {
                "metricName": "Sharpe Ratio",
                "metricValue": currentState && currentState.performance ? (currentState.performance.ratios.sharperatio).toFixed(2).toString() : "-",
                "metricDescription": "Sharpe Ratio"
            },
            {
                "metricName": "Information Ratio",
                "metricValue": currentState && currentState.performance ? (currentState.performance.ratios.informationratio).toFixed(2).toString() : "-",
                "metricDescription": "Information Ratio"
            },
            {
                "metricName": "Beta",
                "metricValue": currentState && currentState.performance ? (currentState.performance.ratios.beta).toFixed(2).toString() : "-",
                "metricDescription": "Beta"
            },
            
        ];
      let metricsCols = [];
      for(let i=0; i<metrics.length; i++){
        metricsCols.push(
          <Col key={'metrics_cols_'+i} sm={6} md={3} style={{'display': 'flex', 'justifyContent': 'center'}}>
            <div style={{'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
              'textAlign': 'left'}}>
              <h2 style={{'fontSize': '20px', 'fontWeight': '400', 'margin': '0px'}}>
                {metrics[i]['metricValue']}
              </h2>
              <p style={{'fontSize': '12px', 'fontWeight': '400', 'margin': '0px'}}>
                {metrics[i]['metricName']}
              </p>
            </div>
          </Col>
        );
      }
      return metricsCols;
    }

    const getPortfolioDataFromDate = (dateString) => {
      let dataToReturn = [];
      if (this.state.portfolioHistory.portfolioHistory && this.state.portfolioHistory.portfolioHistory[dateString]){
        dataToReturn = this.state.portfolioHistory.portfolioHistory[dateString];
      }
      return dataToReturn;
    }

    const getPortfolioDataCountFromDate = (dateString) => {
      let dataToReturn = [];
      if (this.state.portfolioHistory.portfolioHistory && this.state.portfolioHistory.portfolioHistory[dateString]){
        dataToReturn = this.state.portfolioHistory.portfolioHistory[dateString];
      }
      return dataToReturn.length;
    }


    const getPortfolioHistoryTable = () => {
      if (this.state.portfolioHistory){
        if (this.state.portfolioMode === 'LatestPortfolio' && this.state.portfolioHistory){
          return (
            <ReactTable key={'LatestPortfolio'} columns={this.portfolioColumns} 
              minRows = {4}
              showPagination = {false}
              defaultPageSize = {this.state.portfolioHistory.latestPortfolio.length}
              data={this.state.portfolioHistory.latestPortfolio} 
              defaultExpanded={{0: true}}
              SubComponent={row => {
                return (
                  <div style={{'padding': '20px'}}>
                    <ReactTable ref="portfolioHistorySubTable" columns={this.subPortfolioColumns} 
                      data={getPortfolioDataFromDate(row.original.date)} 
                      minRows = {4}
                      showPagination = {false}
                      defaultPageSize = {getPortfolioDataCountFromDate(row.original.date)}
                      headerStyle={{'textAlign': 'left'}} />
                  </div>
                );
              }}
              headerStyle={{'textAlign': 'left'}}/>
          );
        }else if (this.state.portfolioMode === 'PortfolioHistory' && this.state.portfolioHistory){
          return (
            <ReactTable key={'PortfolioHistory'} columns={this.portfolioColumns} 
              minRows = {4}
              filterable
              showPagination = {false}
              defaultPageSize = {this.state.portfolioHistory.portfolioHistorySummary.length}
              data={this.state.portfolioHistory.portfolioHistorySummary} 
              SubComponent={row => {
                return (
                  <div style={{'padding': '20px'}}>
                    <ReactTable ref="portfolioHistorySubTable" columns={this.subPortfolioColumns} 
                      data={getPortfolioDataFromDate(row.original.date)} 
                      minRows = {4}
                      showPagination = {false}
                      defaultPageSize = {getPortfolioDataCountFromDate(row.original.date)}
                      headerStyle={{'textAlign': 'left'}} />
                  </div>
                );
              }}
              headerStyle={{'textAlign': 'left'}}/>
          );
        }
      }
    }

    const getTransactionDataForDate = (dateString) => {
      let dataToReturn = [];
      if (this.state.transactionHistory.transactions && this.state.transactionHistory.transactions[dateString]){
        dataToReturn = this.state.transactionHistory.transactions[dateString];
      }
      dataToReturn.sort((a,b)=>{
        return a.datetime - (b.datetime);
      });
      return dataToReturn;
    }

    const getTransactionDataCountForDate = (dateString) => {
      if (this.state.transactionHistory.transactions && this.state.transactionHistory.transactions[dateString]){
        return this.state.transactionHistory.transactions[dateString].length;
      }else{
        return 0;
      }
    }

    const getProposedOrderForDate = (dateString) => {
      let dataToReturn = [];
      if (this.state.transactionHistory.proposedOrdersData && this.state.transactionHistory.proposedOrdersData[dateString]){
        dataToReturn = this.state.transactionHistory.proposedOrdersData[dateString];
      }
      dataToReturn.sort((a,b)=>{
        return a.datetime - (b.datetime);
      });
      return dataToReturn;
    }

    const getProposedOrderCountForDate = (dateString) => {
      if (this.state.transactionHistory.proposedOrdersData && this.state.transactionHistory.proposedOrdersData[dateString]){
        return this.state.transactionHistory.proposedOrdersData[dateString].length;
      }else{
        return 0;
      }
    }

    const getTransactionHistoryTable = () => {
      if (this.state.transactionHistory){
        if (this.state.transactionMode === 'ProposedOrders' && this.state.transactionHistory){
          return (
            <ReactTable key={'ProposedOrders'} columns={this.proposedOrdersColumns} 
              data={this.state.transactionHistory.proposedOrdersSummary} 
              minRows = {4}
              showPagination = {false}
              defaultPageSize = {_.get(this.state, 'transactionHistory.proposedOrdersSummary', []).length}
              SubComponent={row => {
                return (
                  <div style={{'padding': '20px'}}>
                    <ReactTable ref="transactionSubTable" columns={this.subProposedOrdersColumns} 
                      data={getProposedOrderForDate(row.original.date)} 
                      minRows = {4}
                      showPagination = {false}
                      defaultPageSize = {getProposedOrderCountForDate(row.original.date)}
                      headerStyle={{'textAlign': 'left'}} />
                  </div>
                );
              }}
              headerStyle={{'textAlign': 'left'}} />
          );
        }else if (this.state.transactionMode === 'Transactions' && this.state.transactionHistory){
          return (
            <ReactTable ref="transactionTable" columns={this.transactionColumns} 
              data={this.state.transactionHistory.transactionsSummary} 
              minRows = {4}
              filterable
              showPagination = {false}
              defaultPageSize = {this.state.transactionHistory.transactionsSummary.length}
              SubComponent={row => {
                return (
                  <div style={{'padding': '20px'}}>
                    <ReactTable ref="transactionSubTable" columns={this.subTransactionColumns} 
                      data={getTransactionDataForDate(row.original.date)} 
                      minRows = {4}
                      showPagination = {false}
                      defaultPageSize = {getTransactionDataCountForDate(row.original.date)}
                      headerStyle={{'textAlign': 'left'}} />
                  </div>
                );
              }}
              headerStyle={{'textAlign': 'left'}} />
          );
        }
      }
    }

    const getSettingsTabPaneDiv = () => {
      const rows = [];
      if (this.state.settings){
        for(let i=0; i<this.state.settings.length; i++){
          const values = [];
          if (this.state.settings[i].value !== ''){
            values.push(
              <p key={'1'} className="attached-backtest-settings-value" style={{'margin': '0px 5px 0px 0px'}}>
                {this.state.settings[i].value}
              </p>
            );
          }
          if (this.state.settings[i].value2 !== ''){
            values.push(
              <p key={'2'} className="attached-backtest-settings-value" style={{'margin': '0px 5px 0px 0px'}}>
                {this.state.settings[i].value2}
              </p>
            );
          }
          rows.push(
            <Row key={rows.length} type="flex" align="middle" style={{'marginTop': '10px'}}>
                <Col span={8}>
                   {this.state.settings[i].label}
                </Col>
                <Col span={16} style={{'display': 'flex', 'alignItems': 'center'}}>
                  {values}
                </Col>
            </Row>
          );
        }
      }
      return (
        <div style={{'padding': '20px', 'display': 'flex'}}>
            <div style={{'border': '1px solid #e1e1e1', 'padding': '10px', 'minWidth': '450px'}}>
              <h2 style={{'fontWeight': '700', 'fontSize': '18px'}}>Settings</h2>
              {rows}
            </div>
        </div>
      );
    }

    const getLogsTabPaneDiv = () => {
      if (this.state.logs){
        const logs = [];
        for(let i=0; i<this.state.logs.length; i++){
          logs.push(
            <div key={'logs_'+i} 
              style={{'marginTop': '7px'}}>
              <span className="log-type">
                [{this.state.logs[i].messagetype}]&nbsp;&nbsp;&nbsp;
              </span>
              <span className="log-date-time">
                [{this.state.logs[i].dt}]&nbsp;&nbsp;&nbsp;
              </span>
              <span className="log-message">
                {this.state.logs[i].message}
              </span>
            </div>
          );
        }
        return (
          <div className="backtest-logs" style={{'background': '#323232'}}>
            {logs}
          </div>
        );
      }
    }

    const getForwardTestTabs = () => {
      if (!this.state.loading){
        const tabs = [];

        tabs.push(<TabPane tab="Performance" key="performance" style={{'height': '430px',
            'overflowY': 'auto'}}>
                <LiveTestPerformanceChart 
                  uniqueKey={'performanceChart'}
                  chartData={this.state.performanceChartData} 
                  isForwardTestActive={false}/>
            </TabPane>);
        tabs.push(<TabPane tab="Code" key="code" style={{'height': '430px'}}>
                <AceEditor
                  mode="julia"
                  theme="xcode"
                  name="UNIQUE_ID_OF_DIV"
                  readOnly={true}
                  value={this.state.forwardTestData.code}
                  width="100%"
                  height="430px"
                  editorProps={{$blockScrolling: "Infinity"}}
                />
            </TabPane>);
        tabs.push(<TabPane tab="Portfolio" key="portfolio" style={{'height': '430px',
            'overflowY': 'auto'}}>
                <div style={{'display': 'flex', 'justifyContent': 'center',
                    'margin': '10px'}}>
                    <Radio.Group onChange={this.handleModeChange} defaultValue={'LatestPortfolio'}>
                      <Radio.Button value="LatestPortfolio">Latest Portfolio</Radio.Button>
                      <Radio.Button value="PortfolioHistory">Portfolio History</Radio.Button>
                    </Radio.Group>
                </div>
                {getPortfolioHistoryTable()}
            </TabPane>);
        tabs.push(<TabPane tab="Transactions" key="transactions" style={{'height': '430px',
            'overflowY': 'auto'}}>
                <div style={{'display': 'flex', 'justifyContent': 'center',
                    'margin': '10px'}}>
                    <Radio.Group onChange={this.handleTransactionModeChange} defaultValue={'ProposedOrders'}>
                      <Radio.Button value="ProposedOrders">Proposed Orders</Radio.Button>
                      <Radio.Button value="Transactions">Transactions</Radio.Button>
                    </Radio.Group>
                </div>
                {getTransactionHistoryTable()}
            </TabPane>);
        tabs.push(<TabPane tab="Logs" key="logs" style={{'height': '430px',
            'overflowY': 'auto'}}>
                {getLogsTabPaneDiv()}
            </TabPane>);
        tabs.push(<TabPane tab="Settings" key="settings" style={{'height': '430px',
            'overflowY': 'auto'}}>
                {getSettingsTabPaneDiv()}
            </TabPane>);
        return (            
          <div style={{'border': '1px solid #e1e1e1', 'marginTop': '15px'}}>
            <Tabs tabPosition={'left'}>
              {tabs}
            </Tabs>
          </div>
        );
      }
    }

    const getForwardtestDiv = () => {
      if (this.state.loading){
        return (
          <div style={{'display': 'flex',
            'alignItems': 'center', 'justifyContent': 'center',
            'minHeight': '300px'}}>
            <Spin indicator={antIconLoading} />
          </div>
        );
      }else{
        return (
          <div>
            <h3>Metrics</h3>
            <Row style={{'marginTop': '10px'}}>
              {
                (this.state.forwardTestData.serializedData) ? (
                  addMetricData(this.state.forwardTestData.serializedData.state)
                ) : addMetricData(undefined)
              } 
            </Row>
            {getForwardTestTabs()}
          </div>
        );
      }
    }

    const getForwardTestDates = () =>{
      if (!this.state.loading){
        return (
          <React.Fragment>
            <p style={{'margin': '0px', 'fontSize': '12px'}}>
              CreatedAt: <Moment format="DD/MM/YYYY hh:mm A">
                {this.state.forwardTestData.createdAt}
              </Moment>
            </p>
            <p style={{'margin': '0px', 'fontSize': '12px'}}>
              Last Updated: <Moment format="DD/MM/YYYY hh:mm A">
                {this.state.forwardTestData.updatedAt}
              </Moment>
            </p>
          </React.Fragment>
        );
      }
    }

    const getLiveTestStatus = () => {
      if (this.state.forwardTestData.error){
        return (
          <p style={{'backgroundColor': '#bd362f',
            'fontSize': '12px', 'fontWeight': '700',
            'color': 'white', 'padding': '3px'}}>
            ERROR
          </p>
        );
      }else if(this.state.forwardTestData.active){
        return (
          <p style={{'backgroundColor': '#339933',
            'fontSize': '12px', 'fontWeight': '700',
            'color': 'white', 'padding': '3px'}}>
            RUNNING
          </p>
        );
      }else if(this.state.forwardTestData.active === false){
        return (
          <p style={{'backgroundColor': '#bd362f',
            'fontSize': '12px', 'fontWeight': '700',
            'color': 'white', 'padding': '3px'}}>
            STOPPED
          </p>
        );
      }
    }

    const getTotalDiv = () => {
      if (!this.state.loading){
        return (
          <div className="forwardtest-detail-div" style={{'padding': '1% 3% 1% 3%', 'width': '100%', 'minHeight': 'calc(100vh - 70px)'}}>
            <div style={{'marginBottom': '10px'}}>
              <Row type="flex" align="middle">
                <Col span={12}>
                  <div style={{'display': 'flex', 'alignItems': 'center'}}>
                    <h2 style={{'color': '#3c3c3c', 'fontWeight': '700', 'fontSize': '18px', 'marginRight': '10px'}}>
                      LIVE TEST for {(this.queryParams) ? this.queryParams.get('strategyName') : ''}
                    </h2>
                    {getLiveTestStatus()}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{'display': 'flex', 'justifyContent': 'flex-end', 'alignItems': 'center'}}>
                    {getStatusButtons()}
                  </div>
                </Col>
              </Row>
              {getForwardTestDates()}
            </div>
            <div style={{'width': '100%'}}>
              {getForwardtestDiv()}
            </div>
          </div>
        );
      }
    }

    return (
      <React.Fragment>
        <div className="main-loader">
          <Loading
            show={this.state.loading}
            color="teal"
            showSpinner={false}
          />
        </div>
        {getTotalDiv()}
      </React.Fragment>
    );
  }
}

export default withRouter(ForwardtestDetail);
