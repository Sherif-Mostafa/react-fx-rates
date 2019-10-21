import React, { useState, useEffect } from "react"
import { Link } from "gatsby"

import Layout from "../../components/layout"
import SEO from "../../components/seo"
import TextBox from "../../components/textbox";

import styles from "./newexchange.module.css"
import { connect } from "react-redux";
import { toggleLoading } from "../../actions/app.action";
import { addNewRecordToHistyory } from "../../actions/exchange.action";
import { updateBalance } from "../../actions/app.action";
import axios from 'axios'
import { API_URLS } from "../../shared/constants/routes-configs";

import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

import { ExchangeHistory } from "../../shared/models/history.model";
import UseInterval from "../../components/useInterval";
import exchangeIcon from "../../images/exchange.png";
import backIcon from "../../images/left-arrow.png";

const NewExchangePage = ({ loading, balance, exchangeHistory, dispatch }) => {

    const [fromCurrencies, setFromCurrencies] = useState([]);
    const [toCurrencies, setToCurrencies] = useState([]);
    const [selectedFromCurrencies, setSelectedFromCurrencies] = useState(0);
    const [selectedToCurrencies, setSelectedToCurrencies] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [runningInterval, setRunningInterval] = useState(true);
    const [newRecord, setNewRecord] = useState({});
    const [rate, setRate] = useState('');

    UseInterval(() => { fireRequests() }, runningInterval ? 10000 : null)

    useEffect(() => {
        fetchData();
        return () => { setRunningInterval(false); }
    }, []);

    useEffect(() => {
        if (!loading && fromCurrencies.length > 0 && toCurrencies.length > 0) {
            getRate();
        }
    }, [fromCurrencies, toCurrencies, selectedFromCurrencies, selectedToCurrencies]);


    const fetchData = () => {
        console.log('first dis', loading)
        dispatch(toggleLoading(true));
        console.log('balance', balance)
        fireRequests()
    }

    const fireRequests = () => {
        axios
            .get(API_URLS.EXCHANGE_RATE.GET_LATEST).then((response) => {
                console.log(response)
                console.log('sec dis', loading)
                fillData(response)
                dispatch(toggleLoading(false));
            });

    }

    const fillData = (response) => {
        const newFromOptions = [];
        const newToOptions = [];
        for (var rate in response.data.rates) {
            newToOptions.push({ value: response.data.rates[rate], rate, newValue: toCurrencies[selectedToCurrencies] && toCurrencies[selectedToCurrencies].rate === rate && toCurrencies[selectedToCurrencies].newValue ? toCurrencies[selectedToCurrencies].newValue : '' });
            newFromOptions.push({ value: response.data.rates[rate], rate, newValue: fromCurrencies[selectedFromCurrencies] && fromCurrencies[selectedFromCurrencies].rate === rate && fromCurrencies[selectedFromCurrencies].newValue ? fromCurrencies[selectedFromCurrencies].newValue : '' });
        }
        setFromCurrencies([...newFromOptions]);
        setToCurrencies([...newToOptions]);
        if (fromCurrencies.length > 0 && toCurrencies.length > 0) {
            getRate();
        }

    }

    const selectFromCurrency = (changedValue) => {
        console.log('selectFromCurrency', changedValue);
        console.log('selectFromCurrency newval', fromCurrencies[changedValue]);

        setSelectedFromCurrencies(changedValue);
        resetNewValCurrencies(fromCurrencies);
        resetNewValCurrencies(toCurrencies);
    }

    const selectToCurrency = (changedValue) => {
        console.log('selectToCurrency', changedValue);
        setSelectedToCurrencies(selectedToCurrencies => {
            console.log('selectToCurrency 2', selectedToCurrencies);
            return changedValue;
        });
        console.log('selectToCurrency 3', selectedToCurrencies);

        resetNewValCurrencies(toCurrencies);
        console.log('selectToCurrency fromCurrencies[selectedFromCurrencies].newValue', fromCurrencies);
        console.log('selectToCurrency fromCurrencies[selectedFromCurrencies].newValue', selectedFromCurrencies);
        convert(fromCurrencies[selectedFromCurrencies].newValue, changedValue);
    }

    const getRate = (selectedFrom = selectedFromCurrencies, selectedTo = selectedToCurrencies) => {
        console.log('getRate fromCurrencies', fromCurrencies);
        console.log('getRate fromCurrencies[selectedFromCurrencies]', fromCurrencies[selectedFrom]);

        let newCurrencyBaseRate = 1 / fromCurrencies[selectedFrom].value;
        console.log('getRate toCurrencies', toCurrencies);
        console.log('getRate toCurrencies[selectedToCurrencies]', toCurrencies[selectedTo]);

        let newToCurrencyBaseRate = 1 / toCurrencies[selectedTo].value;
        console.log(` 1 ${fromCurrencies[selectedFrom].rate} = ${((newCurrencyBaseRate) / newToCurrencyBaseRate).toFixed(2).replace(/\.00$/, '')} ${toCurrencies[selectedTo].rate}`);

        setRate(` 1 ${fromCurrencies[selectedFrom].rate} = ${((newCurrencyBaseRate) / newToCurrencyBaseRate).toFixed(2).replace(/\.00$/, '')} ${toCurrencies[selectedTo].rate}`)
        console.log('getRate done ');

    }

    const resetNewValCurrencies = (newValArr) => {
        newValArr.forEach(item => {
            item.newValue = '';
        })
    }
    const convert = (val, toIndex = null) => {
        console.log('convert', val);
        console.log('convert', toIndex);
        console.log('convert toCurrencies', toCurrencies);
        if (val &&
            RegExp('^-?[0-9]*(\.[0-9]{0,2})?$').test(val)) {
            setErrorMessage('')
            setSuccessMessage('')
            //   if (toCurrencies.length > 0) {
            // to do get the base from dollar and convert it to the current base
            fromCurrencies[selectedFromCurrencies].newValue = val;
            setFromCurrencies([...fromCurrencies])
            const currentCurrency = fromCurrencies[selectedFromCurrencies]
            console.log('convert fromCurrencies', fromCurrencies);
            console.log('convert currentFromCurrency', currentCurrency);

            // 1 dollar = AED: 3.6732
            // AED = 1/3.6732 Dollar
            // 1 dollar = AFN: 78.275005
            // AED  =  AFN *    DollarAED

            let newCurrencyBaseRate = 1 / currentCurrency.value;

            let newToCurrencyBaseRate = 1 / (toIndex !== null ? toCurrencies[toIndex].value : toCurrencies[selectedToCurrencies].value);

            // setRate(` 1 ${fromCurrencies[selectedFromCurrencies].rate} = ${((newCurrencyBaseRate) / newToCurrencyBaseRate).toFixed(2).replace(/\.00$/, '')} ${toIndex !== null ? toCurrencies[toIndex].rate : toCurrencies[selectedToCurrencies].rate}`)
            let convertedValue = ((newCurrencyBaseRate * val) / newToCurrencyBaseRate).toFixed(2).replace(/\.00$/, '');

            if (toIndex !== null) {
                toCurrencies[toIndex].newValue = convertedValue;
            } else {
                toCurrencies[selectedToCurrencies].newValue = convertedValue;
            }

            setToCurrencies([...toCurrencies]);

            // history
            let newRecord = new ExchangeHistory();
            newRecord.date = new Date();
            newRecord.from = currentCurrency.rate;
            newRecord.to = toIndex !== null ? toCurrencies[toIndex].rate : toCurrencies[selectedToCurrencies].rate;
            newRecord.value = val;
            newRecord.result = convertedValue;

            setNewRecord(newRecord)

        } else {
            console.log('Strange val', val);
            val = val ? (+val).toFixed(2) : '';
            console.log('Strange val 2', val);
            fromCurrencies[selectedFromCurrencies].newValue = val;
            setFromCurrencies([...fromCurrencies])

            if (val) {
                setSuccessMessage('')
                setErrorMessage('Error in Number you entered please make sure it contains only numbers with two digits after the dot')
            } else {
                if (toIndex !== null) {
                    toCurrencies[toIndex].newValue = '';
                } else {
                    toCurrencies[selectedToCurrencies].newValue = '';
                }
                console.log('convert newC', toCurrencies);
                setToCurrencies([...toCurrencies]);

            }
        }
    }

    const changeFromCurrentCurrency = () => {
        const result = balance.find(item => item.currency === fromCurrencies[selectedFromCurrencies].rate)
        console.log('result', result);
        return ` ${result.amount} ${result.currency} `;
    }

    const changeToCurrentCurrency = () => {
        const result = balance.find(item => item.currency === toCurrencies[selectedToCurrencies].rate)
        console.log('result', result);
        return ` ${result.amount} ${result.currency} `;
    }

    const excuteExchange = () => {
        const currency = balance.find(item => item.currency === newRecord.from)
        if (currency && currency.amount >= newRecord.value) {
            console.log(newRecord);
            dispatch(addNewRecordToHistyory(newRecord));
            const newBalance = balance.map(item => {
                if (item.currency === newRecord.from) {
                    item.amount = +(+item.amount - +newRecord.value).toFixed(2);
                }
                if (item.currency === newRecord.to) {
                    item.amount = +(+item.amount + +newRecord.result).toFixed(2);
                }
            })
            setSuccessMessage('Exchange Done Successfully');
            resetNewValCurrencies(fromCurrencies);
            resetNewValCurrencies(toCurrencies);
            dispatch(updateBalance(newBalance));
            setNewRecord({});
            console.log(exchangeHistory);
        } else {
            setErrorMessage('Error in Exchange you must have number more the the value you need to exchange')
            setSuccessMessage('')
            setNewRecord({});
        }

    }
    const getSymbol = (selected) => {
        const result = balance.find(item => item.currency === selected.rate)
        return result.symbol || '';
    }
    return (
        <Layout>
            <SEO title="Home" />
            <Link to="/"><div className='back-header'><img src={backIcon} /><span className='back'>Back</span> </div></Link>
            {
                errorMessage && <div className='alert alert-danger'> {errorMessage}</div>
            }
            {
                successMessage && <div className='alert alert-success'> {successMessage} <Link to="/#history">... Check History </Link> </div>
            }
            <div>
                {
                    !loading && fromCurrencies.length > 0 && <>
                        <Carousel className={`${styles.sliderContainer} col-md-6 col-sm-12 slide-from`} showArrows={true} onChange={(item) => { selectFromCurrency(item) }} selectedItem={selectedFromCurrencies} useKeyboardArrows={true} showThumbs={false} verticalSwipe='natural' width='40%' >
                            {
                                fromCurrencies.map((element, i) =>
                                    <div className='currency-container' key={i}>
                                        <div className='currency-code'>{element.rate}</div>
                                        <span className='currency'> {getSymbol(fromCurrencies[selectedFromCurrencies])}</span>   <TextBox
                                            key={i}
                                            type="number"
                                            placeholder='0.00'
                                            onChange={(event) => convert(event.target.value)}
                                            value={element.newValue}
                                        ></TextBox>
                                        <div className='currency-pocket'> You Have
                                                {changeFromCurrentCurrency()}
                                        </div>
                                    </div>
                                )
                            }
                        </Carousel>
                    </>
                }

                {
                    !loading && fromCurrencies.length > 0 && toCurrencies.length > 0 && <>
                        <Carousel className={`${styles.sliderContainer} col-md-6 col-sm-12 slide-to`} showArrows={true} onChange={(event) => selectToCurrency(event)} selectedItem={selectedToCurrencies} useKeyboardArrows={true} showThumbs={false} verticalSwipe='natural' width='40%' >
                            {
                                toCurrencies.map((element, i) =>
                                    <div className='currency-container' key={i}>
                                        <div className='currency-code'>{element.rate}</div>
                                        <span className='currency'> {getSymbol(toCurrencies[selectedToCurrencies])}</span>   <TextBox
                                            key={i}
                                            type="number"
                                            placeholder='0.00'
                                            value={element ? element.newValue : '0.00'}
                                            disabled={true}
                                        ></TextBox>
                                        <div className='row'>
                                            <div className='currency-rate col-md-6'> {rate}  </div> <div className='currency-pocket col-md-6'> You Have
                                                {changeToCurrentCurrency()}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </Carousel>
                        <div className="exchang-btn">
                            <button className="btn btn-primary" disabled={!toCurrencies[selectedToCurrencies].newValue} onClick={() => excuteExchange()} >
                                <img src={exchangeIcon} className="box-image" />
                                <span>Exchange</span>
                            </button>
                        </div>
                    </>
                }
            </div>
        </Layout>
    )
}

export default connect(store => ({
    loading: store.app.loading,
    balance: store.app.balance,
    exchangeHistory: store.exchange.history
}), null)(NewExchangePage)
