import _ from 'lodash';
import moment from 'moment';

export const processRowData = (backtest, index) => {
    const name = `Backtest ${index + 1}`;
    const createdAt = moment(_.get(backtest, 'createdAt', null)).format('DD/MM/YYYY hh:mm A');
    const rawStatus = _.get(backtest, 'status', '');
    // const status = rawStatus[0].toUpperCase() + rawStatus.splice(1, rawStatus.length);
    const key = _.get(backtest, '_id', null);
    const id = _.get(backtest, '_id', null);
    let totalReturn = _.get(backtest, 'output.summary.totalreturn', null);
    totalReturn = totalReturn !== null ? `${totalReturn}%` : '-';
    let sharpeRatio = _.get(backtest, 'output.summary.sharperatio', null);
    sharpeRatio = sharpeRatio !== null ? `${sharpeRatio}%` : '-';
    let startDate = _.get(backtest, 'settings.startDate', null);
    let endDate = _.get(backtest, 'settings.endDate', null);
    const dateRange = startDate + ' - ' + endDate; 
    const isLoading = _.get(backtest, 'isLoading', false);

    return {
        id,
        name,
        createdAt,
        status: rawStatus,
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