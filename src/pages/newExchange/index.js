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

const toFixedWithoutRounding = (number) => {
    return +(number.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0])
}


/**
 * @property {boolean} loading Shows app loading status (from redux store)
 * @property {Array} balance represents user Pockets (from redux store)
 * @property {function} dispatch redux dispatch function to dispatch action creators 
 * NewExchange Page to make exchanges from user Pockets
 */
const NewExchangePage = ({ loading, balance, dispatch }) => {
    /** 
     * @property {Array} fromCurrencies property in the component state to handle array of available currencies we can convert from 
     * @method setFromCurrencies the method from useState hooks that allow to update fromCurrencies
     */
    const [fromCurrencies, setFromCurrencies] = useState([]);
    /** 
    * @property {Array} toCurrencies property in the component state to handle array of available currencies we can convert to 
    * @method setToCurrencies the method from useState hooks that allow to update toCurrencies
    */
    const [toCurrencies, setToCurrencies] = useState([]);
    /** 
    * @property selectedFromCurrencies property in the component state to handle index of current currency we need to convert from
    * setSelectedFromCurrencies the method from useState hooks that allow to update selectedFromCurrencies
    */
    const [selectedFromCurrencies, setSelectedFromCurrencies] = useState(0);
    /** 
    * @property selectedToCurrencies property in the component state to handle index of current currency we need to convert to
    * setSelectedToCurrencies the method from useState hooks that allow to update selectedToCurrencies
    */
    const [selectedToCurrencies, setSelectedToCurrencies] = useState(0);
    /** 
    * @property errorMessage property in the component state to contains any error message need to display  
    * setErrorMessage the method from useState hooks that allow to update errorMessage
    */
    const [errorMessage, setErrorMessage] = useState('');
    /** 
    * @property  successMessage property in the component state to contains any success message need to display  
    * setSuccessMessage the method from useState hooks that allow to update successMessage
    */
    const [successMessage, setSuccessMessage] = useState('');
    /** 
    * @property  runningInterval property in the component state to either allow interval or not 
    * setRunningInterval the method from useState hooks that allow to update runningInterval
    */
    const [runningInterval, setRunningInterval] = useState(true);
    /** 
    * @property  newRecord property in the component state to contains new History record of the latest exchange 
    * setNewRecord the method from useState hooks that allow to update newRecord
    */
    const [newRecord, setNewRecord] = useState({});

    /** 
    * @property  rate property in the component state to display the rate between the currency we need to exchange from and the currency we need to exchange to
    * setRate the method from useState hooks that allow to update rate
    */
    const [rate, setRate] = useState('');

    /** 
    * @property  retry property in the component state to handle retry button if api call failed 
    * setRetry the method from useState hooks that allow to update retry
    */
    const [retry, setRetry] = useState(false);

    /** UseInterval component to handle setInterval calls that allows to stop interval anytime from component state */
    UseInterval(() => { fireRequests() }, runningInterval ? 10000 : null);

    /** 
     * @method useEffect with empty array as deps that effect will only activate if the values in the list is empty
     */
    useEffect(() => {
        fetchData();
        return () => { setRunningInterval(false); }
    }, []);

    /** 
     * @method useEffect with array as deps that effect will only activate if any values in the list changed
     */
    useEffect(() => {
        if (!loading && fromCurrencies.length > 0 && toCurrencies.length > 0) {
            getRate();
        }
    }, [fromCurrencies, toCurrencies, selectedFromCurrencies, selectedToCurrencies]);

    /** 
     * @method fetchData this method to dispaly loading from redux store ( dispatch(toggleLoading(true)) ) and make exchange rates api call 
     */
    const fetchData = () => {
        setRetry(false);
        dispatch(toggleLoading(true));
        fireRequests();
    }

    /** 
     * @method fireRequests this method uses axios promise to fire the exchange rates api call and hide loading and fill component state data 
     */
    const fireRequests = () => {
        axios
            .get(API_URLS.EXCHANGE_RATE.GET_LATEST).then((response) => {
                fillData(response)
                dispatch(toggleLoading(false));
            }).catch(() => setRetry(true));
        ;
    }

    /** 
     * @param response api response
     * @method fillData this method fills component state data 
     */
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

    /** 
     * @param changedValue new Index
     * @method selectFromCurrency called in carousel, changes the current fromCurrency  
     */
    const selectFromCurrency = (changedValue) => {
        setSelectedFromCurrencies(changedValue);
        resetNewValCurrencies(fromCurrencies);
        resetNewValCurrencies(toCurrencies);
    }

    /** 
     * @param changedValue new Index
     * @method selectToCurrency called in carousel, changes the current toCurrency  
     */
    const selectToCurrency = (changedValue) => {
        setSelectedToCurrencies(selectedToCurrencies => {
            return changedValue;
        });

        resetNewValCurrencies(toCurrencies);
        convert(fromCurrencies[selectedFromCurrencies].newValue, changedValue);
    }

    /**
     * @method getRate gets the exchange rate between 1 unit from the current selected currency and the result of the to currency
     */
    const getRate = (selectedFrom = selectedFromCurrencies, selectedTo = selectedToCurrencies) => {
        let newCurrencyBaseRate = 1 / fromCurrencies[selectedFrom].value;
        let newToCurrencyBaseRate = 1 / toCurrencies[selectedTo].value;
        setRate(` 1 ${fromCurrencies[selectedFrom].rate} = ${toFixedWithoutRounding(((newCurrencyBaseRate) / newToCurrencyBaseRate)).toString().replace(/\.00$/, '')} ${toCurrencies[selectedTo].rate}`);
    }

    /**
     * @param newValArr represents the array we need to reset (fromCurrencies || toCurrencies)
     * @method resetNewValCurrencies resets all items newValue of given array
     */
    const resetNewValCurrencies = (newValArr) => {
        newValArr.forEach(item => {
            item.newValue = '';
        })
    }

    /**
     * @param val represents the value we need to convert
     * @param toIndex represents index of the item in toCurrencies array we need to convert to with null default value
     * @method convert responsible for the convertion between two currencies from user pocket
     */
    const convert = (val, toIndex = null) => {
        if (val &&
            RegExp('^-?[0-9]*(\.[0-9]{0,2})?$').test(val)) {
            setErrorMessage('')
            setSuccessMessage('')
            // to do get the base from dollar and convert it to the current base
            fromCurrencies[selectedFromCurrencies].newValue = val;
            setFromCurrencies([...fromCurrencies])
            const currentCurrency = fromCurrencies[selectedFromCurrencies]

            // 1 dollar = AED: 3.6732
            // AED = 1/3.6732 Dollar
            // 1 dollar = AFN: 78.275005
            // AED  =  AFN *    DollarAED

            let newCurrencyBaseRate = 1 / currentCurrency.value;

            let newToCurrencyBaseRate = 1 / (toIndex !== null ? toCurrencies[toIndex].value : toCurrencies[selectedToCurrencies].value);

            let convertedValue = toFixedWithoutRounding(((newCurrencyBaseRate * val) / newToCurrencyBaseRate)).toString().replace(/\.00$/, '');

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
            val = val ? toFixedWithoutRounding((+val)) : '';
            fromCurrencies[selectedFromCurrencies].newValue = val;
            setFromCurrencies([...fromCurrencies])

            if (val) {
                setSuccessMessage('')
                setErrorMessage('Number Format Error: Please enter an amount with no more than two digits after the dot')
            } else {
                if (toIndex !== null) {
                    toCurrencies[toIndex].newValue = '';
                } else {
                    toCurrencies[selectedToCurrencies].newValue = '';
                }
                setToCurrencies([...toCurrencies]);

            }
        }
    }

    /**
     * @param currenciesArr represents the currency array
     * @param selectedIndex represents index of the item in currenciesArr array we have in Pocket
     * @method changeCurrentCurrency responsible for displaying the amount of this index of that currencyArry we have in pocket
     */
    const changeCurrentCurrency = (currenciesArr, selectedIndex) => {
        const result = balance.find(item => item.currency === currenciesArr[selectedIndex].rate)
        return ` ${result.amount} ${result.currency} `;
    }

    /**
     * @method excuteExchange responsible for executing the exchange and adding this transaction in history
     */
    const excuteExchange = () => {
        const currency = balance.find(item => item.currency === newRecord.from)
        if (currency && currency.amount >= newRecord.value) {
            dispatch(addNewRecordToHistyory(newRecord));
            const newBalance = balance.map(item => {
                if (item.currency === newRecord.from) {
                    item.amount = toFixedWithoutRounding(+(+item.amount - +newRecord.value));
                }
                if (item.currency === newRecord.to) {
                    item.amount = toFixedWithoutRounding(+(+item.amount + +newRecord.result));
                }
            })
            setErrorMessage('');

            setSuccessMessage('Exchange Done Successfully');
            resetNewValCurrencies(fromCurrencies);
            resetNewValCurrencies(toCurrencies);
            dispatch(updateBalance(newBalance));
            setNewRecord({});
        } else {
            setErrorMessage('Exchanging Error: You can not exchange amount more than what you have in your pocket');
            setSuccessMessage('');
            setNewRecord({});
        }

    }

    /**
     * @param selected selected currency
     * @method getSymbol responsible for displaying selected currency's symbol
     */
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
            {
                retry && <div className='retry '>
                    <div className="alert alert-danger">Something Went Wrong </div>
                    <button className='btn btn-secondary' onClick={() => fetchData()}>Retry</button>
                </div>
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
                                                {changeCurrentCurrency(fromCurrencies, selectedFromCurrencies)}
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
                                                {changeCurrentCurrency(toCurrencies, selectedToCurrencies)}
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
        </Layout >
    )
}

export default connect(store => ({
    loading: store.app.loading,
    balance: store.app.balance,
}), null)(NewExchangePage)
