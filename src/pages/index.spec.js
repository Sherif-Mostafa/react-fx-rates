import React from "react"
import renderer from "react-test-renderer"
import { StaticQuery } from "gatsby"
import Index from "./index"
import configureMockStore from "redux-mock-store";
import Enzyme, { shallow } from "enzyme";
import toJson from "enzyme-to-json";

import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() })
const initialState = {
    app: {
        loading: false, balance: []
    },
    exchange: {
        history: []
    }
};
const mockStore = configureMockStore([]);

let wrapper;
let store;

beforeEach(() => {
    StaticQuery.mockImplementationOnce(({ render }) =>
        render({
            site: {
                siteMetadata: {
                    title: `Default Starter`,
                },
            },
        })
    )
    store = mockStore(initialState)
    wrapper = shallow(<Index store={store} />);
})

describe("Index", () => {

    it("renders correctly", () => {
        const tree = toJson(wrapper);
        expect(tree).toMatchSnapshot()
    })

})