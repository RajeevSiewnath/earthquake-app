import React from 'react';
import {rest} from 'msw';
import {setupServer} from 'msw/node';
import {render, waitFor} from '@testing-library/react';
import {Provider} from "react-redux";
import testData from './test-data.json';
import testData2 from './test-data2.json';
import App from "./App";
import {configureStore} from "@reduxjs/toolkit";
import earthquakeReducer from "./earthquakeReducer";
import userEvent from "@testing-library/user-event";

const server = setupServer(
    rest.get('https://earthquake.usgs.gov/fdsnws/event/1/query', (req, res, ctx) => {
        const t = {...testData as unknown as any};
        t.features = t.features.filter((t: any) => {
            if (req.url.searchParams.has('minmagnitude')) {
                if (parseFloat(t.properties.mag) < parseFloat(req.url.searchParams.get('minmagnitude')!)) {
                    return false;
                }
            }
            if (req.url.searchParams.has('magtype')) {
                if (req.url.searchParams.get('magtype')! !== t.properties.magType) {
                    return false;
                }
            }
            return true;
        });
        return res(ctx.delay(100), ctx.json(t));
    }),
    rest.get('https://earthquake.usgs.gov/fdsnws/event/1/application.json', (req, res, ctx) => {
        return res(ctx.delay(100), ctx.json(testData2));
    }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('renders list', async () => {
    const dom = render(<Provider store={configureStore({
        reducer: {
            earthquake: earthquakeReducer,
        },
    })}><App/></Provider>);
    await waitFor(() => expect(dom.container.querySelectorAll('.result').length).toBe(11));
});

test('renders mag types', async () => {
    const dom = render(<Provider store={configureStore({
        reducer: {
            earthquake: earthquakeReducer,
        },
    })}><App/></Provider>);
    await waitFor(() => expect(dom.container.querySelectorAll('option').length).toBe(36));
});

test('renders with mag filter', async () => {
    const dom = render(<Provider store={configureStore({
        reducer: {
            earthquake: earthquakeReducer,
        },
    })}><App/></Provider>);
    const magInput = dom.container.querySelector('input[type=number]') as HTMLInputElement;
    expect(magInput).toBeInTheDocument();
    const button = dom.container.querySelector("button");
    expect(button).toBeInTheDocument();

    userEvent.type(magInput, "7");
    userEvent.click(button!);

    await waitFor(() => expect(dom.container.querySelectorAll('.result').length).toBe(3));
});

test('renders with mag type filter', async () => {
    const dom = render(<Provider store={configureStore({
        reducer: {
            earthquake: earthquakeReducer,
        },
    })}><App/></Provider>);
    const magTypeSelect = dom.container.querySelector('select') as HTMLSelectElement;
    expect(magTypeSelect).toBeInTheDocument();
    const button = dom.container.querySelector("button");
    expect(button).toBeInTheDocument();

    await waitFor(() => expect(dom.container.querySelectorAll('option').length).toBe(36));

    userEvent.selectOptions(magTypeSelect, "ma");
    userEvent.click(button!);

    await waitFor(() => expect(dom.container.querySelectorAll('.result').length).toBe(4));
});

test('renders with both filters', async () => {
    const dom = render(<Provider store={configureStore({
        reducer: {
            earthquake: earthquakeReducer,
        },
    })}><App/></Provider>);
    const magInput = dom.container.querySelector('input[type=number]') as HTMLInputElement;
    expect(magInput).toBeInTheDocument();
    const magTypeSelect = dom.container.querySelector('select') as HTMLSelectElement;
    expect(magTypeSelect).toBeInTheDocument();
    const button = dom.container.querySelector("button");
    expect(button).toBeInTheDocument();

    await waitFor(() => expect(dom.container.querySelectorAll('option').length).toBe(36));

    userEvent.type(magInput, "7");
    userEvent.selectOptions(magTypeSelect, "ma");
    userEvent.click(button!);

    await waitFor(() => expect(dom.container.querySelectorAll('.result').length).toBe(2));
});
