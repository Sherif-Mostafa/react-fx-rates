import React, { useState, useEffect } from "react"
import { Link } from "gatsby"

import Layout from "../../components/layout"
import SEO from "../../components/seo"

import styles from "./exchange.module.css"
import { connect } from "react-redux";
import { toggleLoading } from "../../actions/app.action";
import { addNewRecordToHistyory } from "../../actions/exchange.action";
import axios from 'axios'
import { API_URLS } from "../../shared/constants/routes-configs";

import Select from 'react-select';

import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";


import { ExchangeHistory } from "../../shared/models/history.model";
import UseInterval from "../../components/useInterval";
console.log('styles 1', styles)

const TextBox = props => (<input onChange={props.onChange}
    className={styles.inputs} type={props.type} pattern={props.pattern} disabled={props.disabled} value={props.value} placeholder={props.placeholder} />);

const ExchangePage = ({ loading, balance, exchangeHistory, dispatch }) => {

    const [fromCurrencies, setFromCurrencies] = useState([]);
    const [toCurrencies, setToCurrencies] = useState([]);
    const [options, setOptions] = useState([]);
    const [selectedFromCurrencies, setSelectedFromCurrencies] = useState(0);
    const [selectedToCurrencies, setSelectedToCurrencies] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [runningInterval, setRunningInterval] = useState(true);
    const [currentTOSelected, setCurrentTOSelected] = useState({});
    const [newRecord, setNewRecord] = useState({});

    UseInterval(() => { fireRequests() }, runningInterval ? 10000 : null)

    useEffect(() => {
        console.log('styles', styles)
        fetchData();
        return () => { setRunningInterval(false); }
    }, []);

    useEffect(() => {
        console.log('fromCurrencies 2 :', fromCurrencies)
        setSelectedFromCurrencies(fromCurrencies.length)
    }, [fromCurrencies]);

    useEffect(() => {
        console.log('toCurrencies 2 :', toCurrencies)
        setSelectedToCurrencies(toCurrencies.length)
    }, [toCurrencies]);

    const fetchData = () => {
        dispatch(toggleLoading(true));
        console.log('first dis', loading)
        console.log('balance', balance)
        fireRequests()

    }

    const fireRequests = () => {
        const getLatestRates = axios
            .get(API_URLS.EXCHANGE_RATE.GET_LATEST);
        const getCurrenciesFullName = axios
            .get(API_URLS.EXCHANGE_RATE.GET_CURRENCIES_FULL_NAME);
        Promise.all([getLatestRates, getCurrenciesFullName]).then((response) => {
            console.log(response)
            console.log('sec dis', loading)
            fillData(response)
            dispatch(toggleLoading(false));
        });

    }

    const fillData = (response) => {
        const newOptions = [];
        for (var rate in response[0].data.rates) {
            newOptions.push({ value: response[0].data.rates[rate], label: `(${rate}) ${response[1].data[rate]}`, rate, newValue: '' });
        }
        setOptions(options => ([...newOptions]));
    }

    const handleFromCurrenciesChange = (selectedOption) => {
        setFromCurrencies(fromCurrencies => ([...fromCurrencies, selectedOption]));
        console.log(`fromCurrencies : `, fromCurrencies);
    }

    const removeFromCurrenciesSlide = (index) => {
        setFromCurrencies(fromCurrencies => ([...fromCurrencies.filter((_, i) => i !== index)]));
    }

    const handleToCurrenciesChange = (selectedOption) => {
        console.log(`toCurrencies 1: `, selectedOption);
        console.log(`toCurrencies 21: `, toCurrencies);

        setToCurrencies(toCurrencies => ([...toCurrencies, selectedOption]));
        setCurrentTOSelected(selectedOption);

        console.log(`toCurrencies : `, toCurrencies);
    }

    const removeToCurrenciesSlide = (index) => {
        setToCurrencies(toCurrencies => ([...toCurrencies.filter((_, i) => i !== index)]));
    }

    const updateCurrentTOSelected = (index) => {
        const currentToCurrency = toCurrencies[index];
        console.log('currentToCurrency', currentToCurrency);

        setCurrentTOSelected(currentToCurrency);
    }
    const convert = (event) => {
        console.log('convert', event.target.value);
        console.log('convert toCurrencies', toCurrencies);
        if (event.target.value &&
            RegExp('^-?[0-9]*(\.[0-9]{0,2})?$').test(event.target.value)) {
            setErrorMessage('')
            if (toCurrencies.length > 0) {
                // to do get the base from dollar and convert it to the current base
                const currentCurrency = fromCurrencies.find(item => item.rate === event.target.placeholder)
                console.log('convert currentCurrency', currentCurrency);

                if (currentCurrency) {
                    // 1 dollar = AED: 3.6732
                    // AED = 1/3.6732 Dollar
                    // 1 dollar = AFN: 78.275005
                    // AED  =  AFN *    DollarAED

                    let newCurrencyBaseRate = 1 / currentCurrency.value;
                    console.log('convert newCurrencyBaseRate', newCurrencyBaseRate);
                    console.log('convert currentTOSelected', currentTOSelected);

                    let newToCurrencyBaseRate = 1 / currentTOSelected.value;

                    let convertedValue = (newCurrencyBaseRate * event.target.value) / newToCurrencyBaseRate;
                    console.log('convert convertedValue', convertedValue);
                    //  const newTo = 
                    let newC = toCurrencies.filter(item => {
                        console.log('convert map currentTOSelected', currentTOSelected);
                        console.log('convert map item', item);
                        if (item.rate === currentTOSelected.rate) {
                            item.newValue = convertedValue;
                        }
                    });
                    setToCurrencies(toCurrencies => ([...toCurrencies, ...newC]));
                    console.log('convert currentTOSelected', currentTOSelected);
                    console.log('convert toCurrencies', toCurrencies);

                    // history
                    let newRecord = new ExchangeHistory();
                    newRecord.date = new Date();
                    newRecord.from = currentCurrency.rate;
                    newRecord.to = currentTOSelected.rate;
                    newRecord.value = event.target.value;
                    newRecord.result = convertedValue;

                    setNewRecord(newRecord)
                }
            } else {
                let newC = toCurrencies.filter(item => {
                    console.log('convert map currentTOSelected', currentTOSelected);
                    console.log('convert map item', item);
                    if (item.rate === currentTOSelected.rate) {
                        item.newValue = '';
                    }
                });
                setToCurrencies(toCurrencies => ([...toCurrencies, ...newC]));
                setNewRecord({});
            }
        } else {
            event.target.value = event.target.value ? (+event.target.value).toFixed(2) : '';
            if (event.target.value) {
                setErrorMessage('Error in Number you entered please make sure it contains only numbers with two digits after the dot')
            }
        }
    }

    const excuteExchange = () => {
        console.log(newRecord);
        dispatch(addNewRecordToHistyory(newRecord));
        setNewRecord({});
        console.log(exchangeHistory);
    }
    const changeToCurrentCurrency = () => {
        const result = fromCurrencies.length > 0 ? balance.map(item => {
            console.log('changeToCurrentCurrency item', item)

            let currencyValue = options.find(element => element.rate === item.currency)
            console.log('changeToCurrentCurrency currencyValue', currencyValue)

            let newCurrencyBaseRate = 1 / currencyValue.value;
            console.log('changeToCurrentCurrency fromCurrencies[selectedFromCurrencies]', selectedFromCurrencies)
            console.log('changeToCurrentCurrency fromCurrencies[selectedFromCurrencies]', fromCurrencies)
            console.log('changeToCurrentCurrency fromCurrencies[selectedFromCurrencies]', selectedFromCurrencies >= fromCurrencies.length ?
                fromCurrencies[fromCurrencies.length - 1].rate :
                fromCurrencies[selectedFromCurrencies].rate)

            let newToCurrencyBaseRate = selectedFromCurrencies !== 0 && selectedFromCurrencies >= fromCurrencies.length ?
                1 / fromCurrencies[fromCurrencies.length - 1].value :
                1 / fromCurrencies[selectedFromCurrencies].value;
            console.log('changeToCurrentCurrency newToCurrencyBaseRate', newToCurrencyBaseRate)

            let convertedValue = (newCurrencyBaseRate * item.amount) / newToCurrencyBaseRate;
            console.log('changeToCurrentCurrency convertedValue', convertedValue)


            console.log('changeToCurrentCurrency result :  ', convertedValue + ' ' + (selectedFromCurrencies >= fromCurrencies.length ?
                fromCurrencies[fromCurrencies.length - 1].rate :
                fromCurrencies[selectedFromCurrencies].rate))

            return `  ${item.amount} ${item.currency} = ${convertedValue} ${(selectedFromCurrencies >= fromCurrencies.length ? fromCurrencies[fromCurrencies.length - 1].rate :
                fromCurrencies[selectedFromCurrencies].rate)}`
        }) : balance.map(item => {
            return `  ${item.amount} ${item.currency}`
        });
        console.log('result', result);
        return result;
    }
    const test = (changedValue) => {
        setSelectedFromCurrencies(changedValue)
    }
    return (
        <Layout>
            <SEO title="Page two" />
            <h1>Hi from the Exchange</h1>
            <p>Welcome to Exchange page</p>
            {
                errorMessage && <div className={styles.error}> {errorMessage}</div>
            }
            {
                !loading && <Select
                    onChange={handleFromCurrenciesChange}
                    options={options} />
            }
            {
                fromCurrencies.length > 0 && <>
                    <Carousel showArrows={true} onChange={(ta5) => { test(ta5) }} selectedItem={selectedFromCurrencies} useKeyboardArrows={true} showThumbs={false} verticalSwipe='natural' width='40%' >
                        {
                            fromCurrencies.map((element, i) =>
                                <div key={i}>
                                    <button id="btn_hide" type="button" class="close pull-right" aria-label="Close" onClick={() => removeFromCurrenciesSlide(i)}>
                                        <span class='icon icon-close modal-close'>TEEEEEEST</span>
                                    </button>
                                    <TextBox
                                        key={i}
                                        type="number"
                                        placeholder={element.rate}
                                        onChange={(event) => convert(event)}
                                    ></TextBox>
                                </div>
                            )
                        }
                    </Carousel>

                </>
            }
            <p> You Have
                        {changeToCurrentCurrency()}
            </p>
            {
                !loading && fromCurrencies.length > 0 && <Select
                    onChange={handleToCurrenciesChange}
                    options={options} />
            }
            {
                fromCurrencies.length > 0 && toCurrencies.length > 0 && <>
                    <Carousel showArrows={true} onChange={(event) => updateCurrentTOSelected(event)} selectedItem={selectedToCurrencies} useKeyboardArrows={true} showThumbs={false} verticalSwipe='natural' width='40%' >
                        {
                            toCurrencies.map((element, i) =>
                                <div key={i} >
                                    <button id="btn_hide" type="button" className="close pull-right" aria-label="Close" onClick={() => removeToCurrenciesSlide(i)}>
                                        <span className='icon icon-close modal-close'>TEEEEEEST</span>
                                    </button>
                                    {console.log(toCurrencies)}
                                    {console.log(element)}
                                    <TextBox
                                        key={i}
                                        type="number"
                                        placeholder={element ? element.rate : 'test'}
                                        value={element ? element.newValue : 'test'}
                                        disabled={true}
                                    ></TextBox>
                                </div>
                            )
                        }
                    </Carousel>
                    <button type="button" className="" disabled={Object.keys(newRecord).length <= 0} aria-label="Close" onClick={() => excuteExchange()}>
                        Exchange
                    </button>
                </>
            }
            <Link to="/">Go back to the homepage</Link>
        </Layout >
    )
}

export default connect(store => ({
    loading: store.app.loading,
    balance: store.app.balance,
    exchangeHistory: store.exchange.history
}), null)(ExchangePage)
