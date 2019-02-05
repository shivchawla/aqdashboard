import React from 'react';
import { withRouter } from 'react-router-dom';
import {Table} from 'antd';
import moment from 'moment';
import Utils from './../../Utils';


class BackTests extends React.Component {

    constructor(props){
    	super()
    	this.state = {
      };

      this.onBackTestClicked = (backtestId) =>{
        if (this.props.onBackTestClicked){
          this.props.onBackTestClicked(backtestId);
        }
      }
      
    }
   
    render() {

      const columns = [{
        title: 'Backtest',
        dataIndex: 'name'
      },{
        title: 'Created Date',
        dataIndex: 'createdAt'
      },{
        title: 'Status',
        dataIndex: 'status'
      },{
        title: 'Date Range',
        dataIndex: 'dateRange'
      },{
        title: 'Total Return',
        dataIndex: 'totalreturn'
      },{
        title: 'Sharpe Ratio',
        dataIndex: 'sharperatio'
      }];
      // rowSelection object indicates the need for row selection
      const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
          this.onBackTestClicked(selectedRowKeys[0]);
        },
        type: 'radio'
      };

      const data = [];
      if(this.props.backtests){
        for(let i=0; i<this.props.backtests.length; i++){
          const dty = this.props.backtests[i];
          let dataObj = {};
          dataObj['name'] = "Backtest " + (i+1);
          dataObj['createdAt'] = moment(dty.createdAt).format('DD/MM/YYYY hh:mm A');
          dataObj['status'] = Utils.firstLetterUppercase(dty.status);
          dataObj['key'] = dty._id;
          if(dty.output && dty.output.summary){
            dataObj['totalreturn'] = dty.output.summary.totalreturn;
          }
          if(dty.output && dty.output.summary){
            dataObj['sharperatio'] = dty.output.summary.sharperatio;
          }
          if (dty.settings && dty.settings.startDate && dty.settings.endDate){
            dataObj['dateRange'] = moment(dty.settings.startDate).format('DD/MM/YYYY') + ' - '
              + moment(dty.settings.endDate).format('DD/MM/YYYY');
          }else{
            dataObj['dateRange'] = "";
          }
          data.push(dataObj);
        }
      }

      return (
        <div style={{'height': 'calc(100% - 25px)', 'overflowY': 'auto'}}>
          <Table className="attach-backtests-table" rowSelection={rowSelection} 
            columns={columns} dataSource={data} pagination={false}
          />
        </div>
      );
    }
}
export default withRouter(BackTests);

