import React from "react"
import renderer from "react-test-renderer"
import { StaticQuery } from "gatsby"
import Exchange from "./index"
import configureMockStore from "redux-mock-store";
import Enzyme, { shallow, mount } from "enzyme";
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
    wrapper = shallow(<Exchange store={store} />);
})

describe("Exchange", () => {

    it(" Exchange renders correctly", () => {
        const tree = toJson(wrapper);
        expect(tree).toMatchSnapshot()
    })


    it(" Exchange Normal instance equal null", () => {
        const instance = wrapper.instance();
        expect(instance).toEqual(null);
    })

    it(" Spy on useEffect", () => {
        wrapper = shallow(<Exchange store={store} />);
        // console.log(wrapper.dive().dive().debug())
        expect(wrapper.dive().dive().find('.back').exists()).toEqual(true);

    })
})