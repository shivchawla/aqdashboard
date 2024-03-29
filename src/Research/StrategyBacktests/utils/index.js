import _ from 'lodash';
import moment from 'moment';
import Utils from '../../../Utils';

export const processRowData = (backtest, index) => {
    const dateFormat = 'DD/MM/YYYY';
    const name = `Backtest ${index + 1}`;
    const createdAt = moment(_.get(backtest, 'createdAt', null)).format('DD/MM/YYYY hh:mm A');
    const rawStatus = _.get(backtest, 'status', '');
    // const status = rawStatus[0].toUpperCase() + rawStatus.splice(1, rawStatus.length);
    const key = _.get(backtest, '_id', null);
    const id = _.get(backtest, '_id', null);
    let totalReturn = _.get(backtest, 'output.summary.totalreturn', null);
    totalReturn = totalReturn !== null ? `${totalReturn.toFixed(2)}%` : '-';
    let sharpeRatio = _.get(backtest, 'output.summary.sharperatio', null);
    sharpeRatio = sharpeRatio !== null ? `${sharpeRatio.toFixed(2)}` : '-';
    let startDate = _.get(backtest, 'settings.startDate', null);
    startDate = startDate !== null ? moment(startDate).format(dateFormat) : startDate;
    let endDate = _.get(backtest, 'settings.endDate', null);
    endDate = endDate !== null ? moment(endDate).format(dateFormat) : endDate;
    const dateRange = startDate + ' - ' + endDate; 
    const isLoading = _.get(backtest, 'isLoading', false);

    return {
        id,
        name,
        createdAt,
        status: rawStatus[0].toUpperCase() + rawStatus.slice(1),
        key,
        totalReturn,
        sharpeRatio,
        dateRange,
        isLoading
    }
}

export const processBacktests = (backtests = []) => {
    return backtests.map((backtest, index) => {
        return {
            selected: false,
            ...backtest
        }
    })
}