import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Pocket from "../components/pocket"
import exchangeIcon from "../images/exchange.png";
import { toggleLoading } from "../actions/app.action";
import { connect } from "react-redux";

const IndexPage = ({ loading, balance, exchangeHistory, dispatch }) => (
  <Layout>
    <SEO title="Home" />
    <h2 className="title">Pockets</h2>
    {
      balance.length > 0 &&
      <>

        {balance.map((item, i) =>
          <Pocket key={i} currency={item.currency} symbol={item.symbol} title={item.title} amount={item.amount} code={item.code}></Pocket>
        )
        }
      </>
    }

    <div className="exchang-btn">
      <Link to="/newExchange/" onClick={() => dispatch(toggleLoading(true))}>
        <button className="btn btn-primary" >
          <img src={exchangeIcon} className="box-image" />
          <span>Exchange</span>
        </button>
      </Link>
    </div>

    {
      exchangeHistory.length > 0 &&
      <>
        <h2 className="title">History</h2>

        < table id='history' className='table table-striped'>
          <thead>
            <tr>
              <th>To Exchange</th>
              <th>Exchanged Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>

            {exchangeHistory.map((item, i) =>
              <tr key={i}>
                <td>{` ${item.value} ${item.from}`}</td>
                <td>{` ${item.result} ${item.to}`}</td>
                <td>{new Date(item.date).toLocaleString()}</td>
              </tr>
            )
            }
          </tbody>
        </table>
      </>
    }


  </Layout >
)

export default connect(store => ({
  loading: store.app.loading,
  exchangeHistory: store.exchange.history,
  balance: store.app.balance,
}), null)(IndexPage)
