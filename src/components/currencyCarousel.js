
import React from "react"
import TextBox from "./textbox";
import { Carousel } from "react-responsive-carousel";



const CurrencyCarousel = props => (
    <>
        <Carousel className={`${props.stylesContainer}  ${props.style} col-md-6 col-sm-12`} showArrows={true} onChange={(item) => { props.selectCurrency(item) }} selectedItem={props.selected} useKeyboardArrows={true} showThumbs={false} verticalSwipe='natural' width='40%' >
            {
                props.currencies.map((element, i) =>
                    <div className='currency-container' key={i}>
                        <div className='currency-code'>{element.rate}</div>
                        <span className='currency'> {props.getSymbol(props.currencies[props.selected])}</span>   <TextBox
                            key={i}
                            type="number"
                            placeholder='0.00'
                            onChange={(event) => props.convert ? props.convert(event.target.value) : null}
                            value={element ? element.newValue : props.default}
                            disabled={props.disabled}
                        ></TextBox>
                        {!props.rate && <div className='currency-pocket col-md-6'> You Have
                    {props.changeCurrentCurrency(props.currencies, props.selected)}
                        </div>}
                        {props.rate && <div className='row'>
                            <div className='currency-rate col-md-6'> {props.rate()}  </div> <div className='currency-pocket col-md-6'> You Have
                                {props.changeCurrentCurrency(props.currencies, props.selected)}
                            </div>
                        </div>
                        }
                    </div>
                )
            }
        </Carousel>
    </>
)

export default CurrencyCarousel;