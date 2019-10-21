import React from "react";

const Pocket = props => (
    <div className="card-container col-md-6 col-lg-4 col-sm-12">
        <div className="card mt-4 ">
            <div className="card-body currency">
                <div className="row">
                    <div className="col-md-4 text-center my-auto">
                        <span className="currency-symbol">{props.symbol}</span>
                    </div>
                    <div className="col-md-8">
                        <h3 className="card-title">{props.title}</h3>
                        <div className="amount">{`${props.amount} ${props.symbol}`}</div>
                        <div className="code" >{props.currency}</div>
                        <div className=" float-right">
                            <img className="mr-2" src={`https://www.countryflags.io/${props.code}/flat/24.png`} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div >
)

export default Pocket;

