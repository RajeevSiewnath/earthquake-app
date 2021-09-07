import {createAction, createAsyncThunk, createReducer} from "@reduxjs/toolkit";
import axios from "axios";

interface Earthquake {
    id: string;
    mag: number;
    magType: string;
    place: string;
}

interface EarthquakeState {
    list: Array<Earthquake>;
    magTypes: Array<string>;
    magnitude: number;
    magType: string;
    loading: boolean;
    loadingTypes: boolean;
    error: any;
}

export const fetchEarthquakes = createAsyncThunk(
    'earthquake/fetchEarthquakes',
    async (_, {getState}) => {
        const earthquakeState: EarthquakeState = (getState as any)().earthquake;
        const query = ['format=geojson'];
        if (!!earthquakeState.magnitude) {
            query.push(`minmagnitude=${earthquakeState.magnitude}`);
        }
        if (!!earthquakeState.magType) {
            query.push(`magtype=${earthquakeState.magType}`);
        }
        return (await axios.get(`https://earthquake.usgs.gov/fdsnws/event/1/query?${query.join('&')}`)).data.features.map((e: any) => ({
            ...e.properties,
            id: e.id
        }));
    }
);

export const fetchMagTypes = createAsyncThunk(
    'earthquake/fetchMagTypes',
    async (_, {getState}) => {
        const earthquakeState: EarthquakeState = (getState as any)().earthquake;
        if (earthquakeState.magTypes.length) {
            return earthquakeState.magTypes;
        }
        return (await axios.get('https://earthquake.usgs.gov/fdsnws/event/1/application.json')).data.magnitudetypes;
    }
);

export const setMagType = createAction<string>('earthquake/setMagType');
export const setMagnitude = createAction<number>('earthquake/setMagnitude');

export default createReducer<EarthquakeState>({
    list: [],
    magTypes: [],
    magnitude: 0,
    magType: '',
    loading: false,
    loadingTypes: false,
    error: undefined,
}, builder => {
    builder.addCase(setMagType, (state, action) => {
        state.magType = action.payload;
    });
    builder.addCase(setMagnitude, (state, action) => {
        state.magnitude = action.payload;
    });
    builder.addCase(fetchEarthquakes.pending, state => {
        state.error = null;
        state.loading = true;
    });
    builder.addCase(fetchEarthquakes.rejected, (state, e) => {
        console.error(e.error.message);
        state.error = 'Could not fetch earthquakes';
    });
    builder.addCase(fetchEarthquakes.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
    });
    builder.addCase(fetchMagTypes.pending, state => {
        state.error = null;
        state.loading = true;
    });
    builder.addCase(fetchMagTypes.rejected, (state, e) => {
        console.error(e.error.message);
        state.error = 'Could not fetch mag types';
    });
    builder.addCase(fetchMagTypes.fulfilled, (state, action) => {
        state.magTypes = action.payload;
        state.loading = false;
    });
});