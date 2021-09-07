import React, {ReactNode, useCallback, useEffect, useState} from 'react';
import './App.css';
import {RootState, useAppDispatch, useAppSelector} from "./store";
import {fetchEarthquakes, fetchMagTypes, setMagnitude, setMagType} from "./earthquakeReducer";

const PER_PAGE = 100;

function App() {
    const {
        list,
        magTypes,
        magnitude,
        magType,
        loading,
        loadingTypes,
        error,
    } = useAppSelector((state: RootState) => state.earthquake);
    const dispatch = useAppDispatch();

    const [page, setPage] = useState(0);
    const [pages, setPages] = useState(0);

    useEffect(() => {
        setPages(Math.floor(list.length / PER_PAGE));
    }, [list.length]);

    useEffect(() => {
        dispatch(fetchMagTypes()).then(() => {
            dispatch(fetchEarthquakes());
        });
    }, []);

    useEffect(() => {
        if (error) {
            alert(error);
        }
    }, [error]);

    useEffect(() => {
        if (page > pages) {
            setPage(0);
        }
    }, [page, pages]);

    const renderButtons = useCallback(() => {
        const buttons: Array<ReactNode> = [];
        if (page > 0) {
            buttons.push(<button key={1} onClick={() => setPage(page - 1)}>Previous page</button>);
        } else {
            buttons.push(<div key={1}>&nbsp;</div>);
        }
        if ((page - 2) >= 0) {
            buttons.push(<button key={2} onClick={() => setPage(page - 2)}>Page {page - 1}</button>);
        } else {
            buttons.push(<div key={2}>&nbsp;</div>);
        }
        if ((page - 1) >= 0) {
            buttons.push(<button key={3} onClick={() => setPage(page - 1)}>Page {page}</button>);
        } else {
            buttons.push(<div key={3}>&nbsp;</div>);
        }
        buttons.push(<strong key={4}>Page {page + 1}</strong>);
        if ((page + 1) <= pages) {
            buttons.push(<button key={5} onClick={() => setPage(page + 1)}>Page {page + 2}</button>);
        } else {
            buttons.push(<div key={5}>&nbsp;</div>);
        }
        if ((page + 2) <= pages) {
            buttons.push(<button key={6} onClick={() => setPage(page + 2)}>Page {page + 3}</button>);
        } else {
            buttons.push(<div key={6}>&nbsp;</div>);
        }
        if (page < pages) {
            buttons.push(<button key={7} onClick={() => setPage(page + 1)}>Next page</button>);
        } else {
            buttons.push(<div key={7}>&nbsp;</div>);
        }
        buttons.push(<span key={8}>page {page + 1} of {pages + 1}</span>);
        return buttons;
    }, [page, pages]);

    return (
        <div id="app">
            {loadingTypes ? <div className="loading">Loading...</div> : (
                <>
                    <div id="controls">
                        <strong>Magnitude&nbsp;&nbsp;&nbsp;</strong>
                        <input type="number" step="0.01" value={magnitude}
                               onChange={(e => {
                                   const qMagnitude = parseFloat(e.target.value);
                                   if (!isNaN(qMagnitude)) {
                                       dispatch(setMagnitude(qMagnitude));
                                   }
                               })}/>
                        <strong>MagType&nbsp;&nbsp;&nbsp;</strong>
                        <select value={magType} onChange={(e => dispatch(setMagType(e.target.value)))}>
                            <option value=""/>
                            {magTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                        <button style={{textAlign: "center"}} type="button"
                                onClick={() => dispatch(fetchEarthquakes())}>Search
                        </button>
                    </div>
                    {loading ? <div className="loading">Loading...</div> : (
                        <>
                            <div className="pager">
                                {renderButtons()}
                            </div>
                            <div id="results">
                                <div className="result">
                                    <div>ID</div>
                                    <div>Place</div>
                                    <div>Magnitude</div>
                                    <div>MagType</div>
                                </div>
                                {list.filter((_, i) => i >= page * PER_PAGE && i < (page + 1) * PER_PAGE).map(({id, mag, magType, place}) => (
                                    <div key={id} className="result">
                                        <div>{id}</div>
                                        <div>{place}</div>
                                        <div>{mag}</div>
                                        <div>{magType}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default App;
